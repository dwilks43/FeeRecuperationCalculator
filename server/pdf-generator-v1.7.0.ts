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
      spacing?: Record<string, number>;
      layout?: {
        pageWidthIn?: number;
        pageHeightIn?: number;
        marginIn?: number;
        gridGap?: number;
        cardPadding?: number;
      };
      borders: Record<string, any>;
      badges?: Record<string, any>;
      kpiColors?: Record<string, string>;
    };
    formatting: {
      currency: any;
      percent: any;
      normalizePercent: any;
    };
    labels: {
      unify?: Record<string, string>;
      titleCase?: boolean;
      title?: string;
      footerLeft?: string;
      footerRight?: string;
    };
    dataBindings?: Record<string, any>;
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
  // Check if unify mapping exists and has this label
  const unified = config.pdf.labels?.unify?.[label];
  if (unified) return unified;
  
  // Check if titleCase is enabled
  if (config.pdf.labels?.titleCase) {
    return label.replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Default: return label as-is
  return label;
}

// Resolve nested object path (e.g., "inputs.currentRateDisplay")
function resolvePath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Resolves a key through dataBindings first, then falls back to direct path
 * This handles non-interpolated binding keys like "customerInfo.rows"
 */
function resolveBindingOrPath(key: string, data: any, config: PDFConfig): any {
  // Check if this might be a binding key (e.g., "customerInfo.rows")
  if (key && key.includes('.')) {
    const parts = key.split('.');
    const section = parts[0];
    const property = parts.slice(1).join('.');
    
    // Check if there's a dataBinding for this section.property
    const binding = config.pdf.dataBindings?.[section]?.[property];
    if (binding && Array.isArray(binding)) {
      // Try each fallback path in order
      for (const path of binding) {
        const value = resolvePath(data, path);
        if (value !== null && value !== undefined) {
          return value;
        }
      }
    }
  }
  
  // Fall back to direct path resolution
  return resolvePath(data, key);
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
  const { colors, typography, borders } = config.pdf.theme;
  // Use spacing from config or layout properties from v1.7.5 config
  const spacing = config.pdf.theme.spacing || {
    pageMargin: 36,
    sectionY: 18,
    blockY: 12,
    rowY: 8,
    colGap: config.pdf.theme.layout?.gridGap || 14,
    cardPadding: config.pdf.theme.layout?.cardPadding || 12
  };
  
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
        .h1 { font-size: ${typography.h1?.size || 18}px; font-weight: ${typography.h1?.weight || 700}; color: var(--${(typography.h1?.color || 'brandInk').replace('#', '').toLowerCase()}); }
        .h2 { font-size: ${typography.h2?.size || 14}px; font-weight: ${typography.h2?.weight || 700}; color: var(--${(typography.h2?.color || 'brandInk').replace('#', '').toLowerCase()}); }
        .h3 { font-size: ${typography.h3?.size || 12}px; font-weight: ${typography.h3?.weight || 700}; color: var(--${(typography.h3?.color || 'brandInk').replace('#', '').toLowerCase()}); }
        .label { font-size: ${typography.label?.size || 10}px; font-weight: ${typography.label?.weight || 600}; color: var(--${(typography.label?.color || 'brandInk').replace('#', '').toLowerCase()}); }
        .value { font-size: ${typography.value?.size || 10}px; font-weight: ${typography.value?.weight || 600}; color: var(--${(typography.value?.color || 'brandInk').replace('#', '').toLowerCase()}); }
        .small { font-size: ${typography.fine?.size || typography.small?.size || 9}px; font-weight: ${typography.fine?.weight || typography.small?.weight || 400}; color: var(--${(typography.fine?.color || typography.small?.color || 'mutedInk').replace('#', '').toLowerCase()}); }

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
            font-size: ${typography.h3?.size || 12}px;
            font-weight: ${typography.h3?.weight || 700};
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
        
        /* Title bar styles for v1.7.5 */
        .title-bar {
            display: inline-block;
            width: 4px;
            height: 14px;
            margin-right: 8px;
            border-radius: 2px;
            vertical-align: middle;
        }
        
        .title-bar.ultramarine {
            background: var(--brand-ultramarine);
        }
        
        .title-bar.spruce {
            background: var(--brand-spruce);
        }
        
        .title-text {
            font-weight: 800;
            font-size: 12px;
            vertical-align: middle;
        }
        
        /* Brand logo styles */
        .brand-logo {
            height: 28px;
            max-height: 28px;
            display: block;
        }
        
        .hdr-right .report-line {
            text-align: right;
            line-height: 1.15;
        }
        
        /* Savings legend */
        .savings-legend {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 12px;
            padding-top: 12px;
            border-top: ${borders.hairline};
            font-size: 9px;
            color: var(--neutral40);
        }
        
        .savings-legend span {
            display: flex;
            align-items: center;
            gap: 4px;
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
            font-size: ${typography.h3?.size || 12}px;
            font-weight: ${typography.h3?.weight || 700};
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
            font-size: ${typography.fine?.size || typography.small?.size || 9}px;
            color: var(--neutral40);
        }

        .footer-right {
            display: table-cell;
            text-align: right;
            font-size: ${typography.fine?.size || typography.small?.size || 9}px;
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
            </tr>
        </table>
    </div>
  `;
}

// Resolve data binding with interpolation
function resolveDataBinding(path: string, data: any, config: PDFConfig): any {
  // Handle interpolation like "{{ customerInfo.title }}"
  if (path && path.includes('{{')) {
    return path.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, binding) => {
      const trimmed = binding.trim();
      
      // Check dataBindings first
      const bindingParts = trimmed.split('.');
      if (bindingParts.length >= 2) {
        const section = bindingParts[0];
        const key = bindingParts.slice(1).join('.');
        
        const dataBinding = config.pdf.dataBindings?.[section]?.[key];
        if (dataBinding && Array.isArray(dataBinding)) {
          // Try each fallback path
          for (const fallbackPath of dataBinding) {
            const value = resolvePath(data, fallbackPath);
            if (value !== null && value !== undefined) {
              return value;
            }
          }
        }
      }
      
      // Direct path resolution as fallback
      const value = resolvePath(data, trimmed);
      return value !== null && value !== undefined ? value : '';
    });
  }
  
  // Direct path resolution
  return resolvePath(data, path);
}

// Generate card content
function generateCard(block: any, data: any, config: PDFConfig): string {
  let cardContent = '';
  
  // Resolve title with interpolation
  const title = block.title ? resolveDataBinding(block.title, data, config) : '';
  
  // Handle KPI Rail cards
  if (block.kpiRailFrom) {
    const items = resolveBindingOrPath(block.kpiRailFrom, data, config) || [];
    const kpiConfig = block.kpi || {};
    const labelKey = kpiConfig.labelKey || 'label';
    const valueKey = kpiConfig.valueKey || 'value';
    const valueFormat = kpiConfig.valueFormat || 'currency';
    
    const kpiItems = items.map((item: any) => {
      const label = item[labelKey] || '';
      const value = item[valueKey] || 0;
      const formattedValue = formatValue(value, valueFormat, config);
      
      // Apply color based on item type if available
      const colorMap: Record<string, string> = {
        'cost': 'danger',
        'feesCollected': 'success',
        'bases': 'info',
        'net': 'brand-spruce'
      };
      const colorClass = item.type && colorMap[item.type] ? `kpi-${item.type}` : '';
      
      return `
        <div class="kpi-item">
          <div class="kpi-label">${unifyLabel(label, config)}</div>
          <div class="kpi-value ${colorClass}">${formattedValue}</div>
        </div>
      `;
    }).join('');
    
    // Add the 'after' element if present
    let afterContent = '';
    if (block.after) {
      afterContent = resolveDataBinding(block.after, data, config);
    }
    
    return `
      <div class="kpi-rail">
        ${title ? `<div class="card-title">${title}</div>` : ''}
        ${kpiItems}
        ${afterContent}
      </div>
    `;
  }
  
  // Handle table-based cards
  if (block.table) {
    const table = block.table;
    const rowSources = table.rowsFrom || [];
    const allRows: any[] = [];
    
    // Collect all rows from all sources
    rowSources.forEach((source: any) => {
      const sourceData = resolveBindingOrPath(source.from, data, config);
      if (sourceData) {
        if (Array.isArray(sourceData)) {
          allRows.push(...sourceData);
        } else if (typeof sourceData === 'object') {
          // Convert object to rows
          Object.entries(sourceData).forEach(([key, value]) => {
            allRows.push({ label: key, value: value, format: 'text' });
          });
        }
      }
    });
    
    // Get format hint key
    const formatHintKey = table.valueFormatHintKey || 'format';
    
    // Generate table rows
    const rows = allRows.map((row: any) => {
      const label = unifyLabel(row.label || row.name || '', config);
      const value = row.value !== undefined ? row.value : row.amount;
      const format = row[formatHintKey] || 'text';
      
      // Map format strings to standard formats
      let formatType = format;
      if (format === 'money') formatType = 'currency';
      
      const formattedValue = formatType !== 'text' ? 
        formatValue(value, formatType, config) : 
        String(value || '');
      
      // Handle badges if present
      let badge = '';
      if (row.badge) {
        const badgeStyle = row.badge.style || 'auto';
        const badgeText = row.badge.text || '';
        badge = ` <span class="badge badge-${badgeStyle}">${badgeText}</span>`;
      }
      
      return `
        <tr>
          <th>${label}</th>
          <td>${formattedValue}${badge}</td>
        </tr>
      `;
    }).join('');
    
    cardContent = `
      <table class="kv-table">
        ${rows}
      </table>
    `;
  } else if (block.content?.from) {
    // Legacy: Simple data binding - render customer info from data
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
    // Legacy: Row-based content with conditional rendering
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
  
  // Add footer note if present
  if (block.footerNote) {
    const note = resolveDataBinding(block.footerNote, data, config);
    if (note) {
      cardContent += `<div class="small" style="margin-top: 8px; font-style: italic;">${note}</div>`;
    }
  }
  
  // Add note if present (alternative to footerNote)
  if (block.note) {
    const note = resolveDataBinding(block.note, data, config);
    if (note) {
      cardContent += `<div class="small" style="margin-top: 8px; font-style: italic;">${note}</div>`;
    }
  }
  
  // For KPI rails, return without card wrapper (already has kpi-rail wrapper)
  if (block.kpiRailFrom) {
    return cardContent;
  }
  
  // Add surface class if specified
  const surfaceClass = block.surface === 'subtle' ? ' subtle' : '';
  
  return `
    <div class="card${surfaceClass}">
      ${title ? `<div class="card-title">${title}</div>` : ''}
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
      const sourceData = resolveBindingOrPath(source.from, data, config);
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
  
  // Debug logging
  console.log('PDF Generation - Received data structure:', {
    hasUi: !!data.ui,
    uiSections: data.ui?.sections ? Object.keys(data.ui.sections) : [],
    uiMonthlySavings: !!data.ui?.monthlySavings,
    topLevelKeys: Object.keys(data)
  });
  
  // Apply program type context for conditional rendering
  const contextData = {
    ...data,
    program: data.programType,
    meta: {
      reportId: data.reportId || Date.now().toString().slice(-8),
      reportDate: data.reportDate || new Date().toLocaleDateString()
    }
  };
  
  const pages = config.pdf.pages.map((page, index) => {
    // Update header with resolved data
    const resolvedPage = {
      ...page,
      header: page.header ? {
        ...page.header,
        title: page.header.title ? resolveDataBinding(page.header.title, contextData, config) : '',
        left: page.header.left ? resolveDataBinding(page.header.left, contextData, config) : '',
        right: page.header.right ? resolveDataBinding(page.header.right, contextData, config) : ''
      } : undefined
    };
    
    const header = page.header?.showOnPage === undefined || page.header?.showOnPage === index + 1 ? 
      generateHeader(resolvedPage, config) : '';
    
    let bodyContent = '';
    
    // Handle new v1.7.3 body structure
    if (Array.isArray(page.body)) {
      page.body.forEach((element: any) => {
        if (element.type === 'card') {
          // Determine column span
          const colSpan = element.colSpan || 12;
          const colClass = colSpan === 7 ? 'grid-col-7' : 
                          colSpan === 5 ? 'grid-col-5' : 
                          colSpan === 12 ? '' : 'grid-col';
          
          const card = generateCard(element, contextData, config);
          
          if (colSpan === 12) {
            bodyContent += card;
          } else {
            // Wrap in grid if needed
            bodyContent += `<div class="grid"><div class="${colClass}">${card}</div></div>`;
          }
        } else if (element.type === 'grid') {
          // Legacy grid structure
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
    }
    
    // Handle footer with resolved data
    const resolvedFooter = page.footer ? {
      ...page.footer,
      left: page.footer.left ? resolveDataBinding(page.footer.left, contextData, config) : '',
      right: page.footer.right ? resolveDataBinding(page.footer.right, contextData, config) : ''
    } : undefined;
    
    const footer = generateFooter({ ...page, footer: resolvedFooter });
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