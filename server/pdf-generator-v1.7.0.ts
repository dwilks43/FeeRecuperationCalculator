import fs from 'fs';
import path from 'path';
import { LOGO_DATA_URL } from './logo-loader.js';

/**
 * v1.7.0 Configuration-Driven PDF Generator
 * Uses pdf.config.json to define layout, styling, and data binding
 * Source of Truth: UI objects - no recalculation, exact mirroring
 */

interface PDFConfig {
  version: string;
  pdf: {
    rendering: {
      sourceOfTruth: string;
      noNewMath: boolean;
      bindStrategy: string;
    };
    theme: {
      colors: Record<string, string>;
      typography: Record<string, any>;
      spacing: Record<string, number>;
      borders: Record<string, any>;
      badges: Record<string, any>;
      kpiColors: Record<string, string>;
    };
    formatting: {
      currency: any;
      percent: any;
      normalizePercent: any;
    };
    labels: {
      unify: Record<string, string>;
      titleCase: boolean;
    };
    pages: any[];
  };
  guards: {
    hideEmptyRows: boolean;
    stripZeroKPIs: boolean;
    coercePercentStrings: boolean;
  };
}

let config: PDFConfig | null = null;

// Load configuration
function loadConfig(): PDFConfig {
  if (!config) {
    const configPath = path.join(process.cwd(), 'pdf.config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData);
  }
  return config!;
}

// Value formatting and normalization
function formatValue(value: any, format: string, config: PDFConfig): string {
  if (value === null || value === undefined) return '';
  
  // Handle string values that already contain % or $
  if (typeof value === 'string') {
    if (config.guards.coercePercentStrings && value.includes('%')) {
      return value; // Pass through as-is
    }
    if (value.includes('$')) {
      return value; // Pass through as-is
    }
  }
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return String(value);
  
  switch (format) {
    case 'currency':
      const currencyFormat = config.pdf.formatting.currency;
      const formatted = numValue.toLocaleString('en-US', {
        minimumFractionDigits: currencyFormat.decimals,
        maximumFractionDigits: currencyFormat.decimals,
        useGrouping: currencyFormat.thousands
      });
      return numValue < 0 && currencyFormat.style === 'leadingMinus' 
        ? `-$${formatted.replace('-', '')}` 
        : `$${formatted}`;
        
    case 'percent':
      const percentFormat = config.pdf.formatting.percent;
      const normalizeConfig = config.pdf.formatting.normalizePercent;
      
      let percentValue = numValue;
      // Auto-normalize: if value > 1 and mode is auto, treat as already percentage
      if (normalizeConfig.mode === 'auto' && numValue > 1 && normalizeConfig.thresholdGtOneTreatAsPercent) {
        percentValue = numValue; // Don't multiply by 100
      } else if (numValue <= 1) {
        percentValue = numValue * 100; // Convert decimal to percentage
      }
      
      const percentFormatted = percentValue.toFixed(percentFormat.decimals);
      return percentValue < 0 && percentFormat.style === 'leadingMinus'
        ? `-${percentFormatted.replace('-', '')}%`
        : `${percentFormatted}%`;
        
    default:
      return String(value);
  }
}

// Apply label unification
function unifyLabel(label: string, config: PDFConfig): string {
  const unified = config.pdf.labels.unify[label];
  if (unified) return unified;
  
  if (config.pdf.labels.titleCase) {
    return label.replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return label;
}

// Resolve nested object path (e.g., "inputs.currentRateDisplay")
function resolvePath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Evaluate conditional expressions (e.g., "program==DUAL_PRICING")
function evaluateCondition(condition: string, data: any): boolean {
  // Simple evaluation for basic conditions
  if (condition.includes('==')) {
    const [left, right] = condition.split('==').map(s => s.trim());
    const leftValue = resolvePath(data, left);
    const rightValue = right.replace(/['"]/g, ''); // Remove quotes
    return leftValue === rightValue;
  }
  if (condition.startsWith('!')) {
    const path = condition.substring(1);
    return !resolvePath(data, path);
  }
  return !!resolvePath(data, condition);
}

// Generate CSS from configuration
function generateCSS(config: PDFConfig): string {
  const { colors, typography, spacing, borders } = config.pdf.theme;
  
  // CSS Variables
  const cssVars = Object.entries(colors)
    .map(([key, value]) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join('\n        ');
  
  return `
    <style>
        :root {
            ${cssVars}
        }

        html, body {
            margin: 0;
            padding: 0;
            font-family: ${typography.fontFamily};
            color: var(--neutral90);
            font-size: 12px;
            line-height: 1.5;
            background: white;
        }

        * {
            box-sizing: border-box;
        }

        .container {
            width: 7.5in;
            margin: 0 auto;
            padding: 0.5in;
            position: relative;
        }

        /* Typography Styles */
        .h1 { font-size: ${typography.h1.size}px; font-weight: ${typography.h1.weight}; color: var(--${typography.h1.color.replace('#', '').toLowerCase()}); }
        .h2 { font-size: ${typography.h2.size}px; font-weight: ${typography.h2.weight}; color: var(--${typography.h2.color.replace('#', '').toLowerCase()}); }
        .h3 { font-size: ${typography.h3.size}px; font-weight: ${typography.h3.weight}; color: var(--${typography.h3.color.replace('#', '').toLowerCase()}); }
        .label { font-size: ${typography.label.size}px; font-weight: ${typography.label.weight}; color: var(--${typography.label.color.replace('#', '').toLowerCase()}); }
        .value { font-size: ${typography.value.size}px; font-weight: ${typography.value.weight}; color: var(--${typography.value.color.replace('#', '').toLowerCase()}); }
        .small { font-size: ${typography.small.size}px; font-weight: ${typography.small.weight}; color: var(--${typography.small.color.replace('#', '').toLowerCase()}); }

        /* Layout Styles */
        .grid { display: table; width: 100%; table-layout: fixed; }
        .grid-col { display: table-cell; vertical-align: top; padding-right: ${spacing.colGap}px; }
        .grid-col:last-child { padding-right: 0; }
        .grid-col-7 { width: 58.33%; }
        .grid-col-5 { width: 41.67%; }

        /* Card Styles */
        .card {
            background: white;
            border-radius: ${borders.radius}px;
            padding: ${spacing.cardPadding}px;
            margin-bottom: ${spacing.blockY}px;
            border: ${borders.hairline};
            box-shadow: 0 1px 3px rgba(0, 78, 211, 0.1);
        }

        .card-title {
            font-size: ${typography.h3.size}px;
            font-weight: ${typography.h3.weight};
            color: var(--brand-ink);
            margin-bottom: ${spacing.rowY}px;
            padding-bottom: ${spacing.rowY}px;
            border-bottom: ${borders.hairline};
        }

        /* Table Styles */
        .kv-table {
            width: 100%;
            border-collapse: collapse;
        }

        .kv-table th {
            text-align: left;
            padding: ${spacing.rowY}px ${spacing.cardPadding}px;
            font-size: ${typography.label.size}px;
            font-weight: ${typography.label.weight};
            color: var(--neutral70);
            background: var(--neutral10);
            border-bottom: ${borders.hairline};
            width: 60%;
        }

        .kv-table td {
            padding: ${spacing.rowY}px ${spacing.cardPadding}px;
            font-size: ${typography.value.size}px;
            font-weight: ${typography.value.weight};
            color: var(--neutral90);
            border-bottom: ${borders.hairline};
        }

        /* KPI Rail Styles */
        .kpi-rail {
            background: white;
            border-radius: ${borders.radius}px;
            padding: ${spacing.cardPadding}px;
            border: ${borders.hairline};
        }

        .kpi-item {
            padding: ${spacing.rowY}px 0;
            border-bottom: ${borders.hairline};
        }

        .kpi-item:last-child {
            border-bottom: none;
        }

        .kpi-label {
            font-size: ${typography.label.size}px;
            font-weight: ${typography.label.weight};
            color: var(--neutral70);
            margin-bottom: 4px;
        }

        .kpi-value {
            font-size: ${typography.value.size + 2}px;
            font-weight: 700;
        }

        .kpi-cost { color: var(--danger); }
        .kpi-feesCollected { color: var(--success); }
        .kpi-bases { color: var(--info); }
        .kpi-net { color: var(--brand-spruce); }

        /* Badge Styles */
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-auto { background: var(--brand-ultramarine); color: white; }
        .badge-manual { background: #FFF7ED; color: #C2410C; }
        .badge-internal { background: #EEF2FF; color: #3730A3; }

        /* Header Styles */
        .header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .brand-cell {
            width: 160px;
            vertical-align: top;
        }

        .title {
            font-size: 20px;
            font-weight: 700;
            color: var(--brand-ink);
            margin-bottom: 4px;
        }

        .subtitle {
            font-size: 14px;
            color: var(--brand-ink);
            font-style: italic;
        }

        .accent-bar {
            height: 3px;
            margin-top: 8px;
            border-radius: 2px;
        }

        .accent-ultramarine { background: var(--brand-ultramarine); }
        .accent-aqua { background: var(--brand-aqua); }

        /* Section Styles */
        .section {
            background: white;
            border-radius: ${borders.radius}px;
            padding: 0;
            margin-bottom: ${spacing.sectionY}px;
            border: ${borders.hairline};
            box-shadow: 0 1px 3px rgba(0, 78, 211, 0.1);
        }

        .section-header {
            padding: ${spacing.cardPadding}px;
            background: var(--neutral10);
            border-radius: ${borders.radius}px ${borders.radius}px 0 0;
            border-bottom: ${borders.hairline};
        }

        .section-title {
            font-size: ${typography.h3.size}px;
            font-weight: ${typography.h3.weight};
            color: var(--brand-ink);
            margin: 0;
        }

        .section-body {
            padding: ${spacing.cardPadding}px;
        }

        /* Page Break */
        .page-break { page-break-before: always; }

        /* Footer Styles */
        .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: ${borders.hairline};
            display: table;
            width: 100%;
        }

        .footer-left {
            display: table-cell;
            font-size: ${typography.small.size}px;
            color: var(--neutral40);
        }

        .footer-right {
            display: table-cell;
            text-align: right;
            font-size: ${typography.small.size}px;
            color: var(--neutral40);
        }
    </style>
  `;
}

// Generate page header
function generateHeader(page: any, config: PDFConfig): string {
  const header = page.header;
  if (!header) return '';

  const accentClass = header.accentBar?.color ? `accent-${header.accentBar.color.replace('brand', '').toLowerCase()}` : '';
  
  return `
    <div class="header-section">
        <table class="header">
            <tr>
                <td class="brand-cell">
                    <img src="${LOGO_DATA_URL}" alt="DMP Logo" 
                         style="width: ${header.logo?.width || 72}px; height: auto; display: block;" />
                </td>
                <td>
                    <div class="title">${header.title || ''}</div>
                    <div class="subtitle">${header.subtitle || ''}</div>
                    ${header.accentBar ? `<div class="accent-bar ${accentClass}"></div>` : ''}
                </td>
                <td style="text-align: right;">
                    <div class="subtitle">Report #: ${Date.now().toString().slice(-8)}</div>
                    <div class="subtitle">Date: ${new Date().toLocaleDateString()}</div>
                </td>
            </tr>
        </table>
    </div>
  `;
}

// Generate card content
function generateCard(block: any, data: any, config: PDFConfig): string {
  let cardContent = '';
  
  if (block.content?.from) {
    // Simple data binding - render customer info from data
    const sourceData = resolvePath(data, block.content.from);
    if (sourceData) {
      cardContent = `
        <table class="kv-table">
          ${Object.entries(sourceData).map(([key, value]) => `
            <tr>
              <th>${unifyLabel(key, config)}</th>
              <td>${value}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }
  } else if (block.content?.rows) {
    // Row-based content with conditional rendering
    const rows = block.content.rows
      .filter((row: any) => !row.if || evaluateCondition(row.if, data))
      .map((row: any) => {
        const value = resolvePath(data, row.value);
        const formattedValue = row.format ? formatValue(value, row.format, config) : value;
        const badge = row.badge && (!row.badge.when || evaluateCondition(row.badge.when, data)) 
          ? `<span class="badge badge-${row.badge.style}">${row.badge.text}</span>` 
          : '';
        const badgeAlt = row.badgeAlt && (!row.badgeAlt.when || evaluateCondition(row.badgeAlt.when, data))
          ? `<span class="badge badge-${row.badgeAlt.style}">${row.badgeAlt.text}</span>`
          : '';
        
        return `
          <tr>
            <th>${unifyLabel(row.label, config)}</th>
            <td>${formattedValue} ${badge}${badgeAlt}</td>
          </tr>
        `;
      }).join('');
    
    cardContent = `
      <table class="kv-table">
        ${rows}
      </table>
    `;
    
    if (block.footerNote) {
      cardContent += `<div class="small" style="margin-top: 8px; font-style: italic;">${block.footerNote}</div>`;
    }
  }
  
  return `
    <div class="card">
      <div class="card-title">${block.title}</div>
      ${cardContent}
    </div>
  `;
}

// Generate KPI Rail
function generateKPIRail(block: any, data: any, config: PDFConfig): string {
  const items = resolvePath(data, block.mirrorFrom) || [];
  const styleMap = config.pdf.theme.kpiColors;
  
  const kpiItems = items.map((item: any) => {
    const styleClass = styleMap[item.type] ? `kpi-${styleMap[item.type]}` : '';
    const formattedValue = item.format ? formatValue(item.value, item.format, config) : item.value;
    
    return `
      <div class="kpi-item">
        <div class="kpi-label">${unifyLabel(item.label, config)}</div>
        <div class="kpi-value ${styleClass}">${formattedValue}</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="kpi-rail">
      <div class="card-title">${block.title}</div>
      ${kpiItems}
    </div>
  `;
}

// Generate section
function generateSection(section: any, data: any, config: PDFConfig): string {
  const badge = section.badge ? `<span class="badge badge-${section.badge.style}">${section.badge.text}</span>` : '';
  
  let tableContent = '';
  if (section.table?.rowsFrom) {
    const rowSources = section.table.rowsFrom;
    const allRows: any[] = [];
    
    rowSources.forEach((source: any) => {
      const sourceData = resolvePath(data, source.from);
      if (sourceData && Array.isArray(sourceData)) {
        allRows.push(...sourceData);
      }
    });
    
    const tableRows = allRows.map((row: any) => `
      <tr>
        <th>${unifyLabel(row.label || row.name || '', config)}</th>
        <td class="value">${formatValue(row.value || row.amount || '', row.format || 'currency', config)}</td>
      </tr>
    `).join('');
    
    tableContent = `
      <table class="kv-table">
        ${tableRows}
      </table>
    `;
  }
  
  return `
    <div class="section">
      <div class="section-header">
        <div class="section-title">${section.title} ${badge}</div>
        ${section.subtitle ? `<div class="small">${section.subtitle}</div>` : ''}
      </div>
      <div class="section-body">
        ${tableContent}
        ${section.note ? `<div class="small" style="margin-top: 8px; font-style: italic;">${section.note}</div>` : ''}
      </div>
    </div>
  `;
}

// Generate page footer
function generateFooter(page: any): string {
  if (!page.footer) return '';
  
  return `
    <div class="footer">
      <div class="footer-left">${page.footer.left || ''}</div>
      <div class="footer-right">${page.footer.right || ''}</div>
    </div>
  `;
}

// Main PDF generation function
export function generateConfigDrivenPDF(data: any): string {
  const config = loadConfig();
  
  // Apply program type context for conditional rendering
  const contextData = {
    ...data,
    program: data.programType
  };
  
  const pages = config.pdf.pages.map((page, index) => {
    const header = generateHeader(page, config);
    
    let bodyContent = '';
    page.body.forEach((element: any) => {
      if (element.type === 'grid') {
        const columns = element.columns.map((col: any) => {
          const colSpan = col.span === 7 ? 'grid-col-7' : col.span === 5 ? 'grid-col-5' : 'grid-col';
          const blocks = col.blocks.map((block: any) => {
            switch (block.type) {
              case 'card':
                return generateCard(block, contextData, config);
              case 'kpiRail':
                return generateKPIRail(block, contextData, config);
              default:
                return '';
            }
          }).join('');
          
          return `<div class="${colSpan}">${blocks}</div>`;
        }).join('');
        
        bodyContent += `<div class="grid">${columns}</div>`;
      } else if (element.type === 'section') {
        bodyContent += generateSection(element, contextData, config);
      }
    });
    
    const footer = generateFooter(page);
    const pageBreak = index > 0 ? 'page-break' : '';
    
    return `
      <div class="${pageBreak}">
        ${header}
        ${bodyContent}
        ${footer}
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DMP Savings Report v${config.version}</title>
        ${generateCSS(config)}
    </head>
    <body>
        <div class="container">
            ${pages}
        </div>
    </body>
    </html>
  `;
}