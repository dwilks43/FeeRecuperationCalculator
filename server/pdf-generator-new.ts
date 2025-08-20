

function generateQuoteStyleHTML(data: any): string {
  const {
    monthlyVolume,
    currentRate,
    interchangeCost,
    flatRate,
    priceDifferential,
    taxRate = 0,
    tipRate = 0,
    baseVolume,
    adjustedVolume,
    currentCost,
    newCost,
    monthlySavings,
    annualSavings,
    customerInfo = {},
    // Try getting customer data directly from top level
    businessName,
    businessAddress,
    contactName,
    contactEmail,
    salesRepName
  } = data;

  // Generate report number and date
  const reportNumber = Date.now().toString().slice(-8);
  const currentDate = new Date().toLocaleDateString();

  // Use the exact simplified template with placeholder replacement - reordered with savings at bottom
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DMP Savings Report</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1f2937;
            background: white;
        }

        .container {
            width: 7.5in;
            margin: 0 auto;
            padding: 0.5in;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #0ea5e9;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        /* Company logo styling for DocRaptor compatibility */
        .company-logo {
            width: 60px;
            height: auto;
            max-height: 60px;
        }

        .company-name {
            font-size: 20pt;
            font-weight: 700;
            color: #0ea5e9;
        }

        .report-info {
            text-align: right;
            font-size: 12pt;
            color: #6b7280;
        }

        /* Unified section styling - all sections match Monthly Processing Savings */
        .section {
            background: linear-gradient(to bottom right, #dbeafe, #e0e7ff);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
        }

        .section-title {
            font-size: 16pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .section-title span {
            font-size: 24px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .data-table th,
        .data-table td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #bfdbfe;
        }

        .data-table th {
            background: rgba(255, 255, 255, 0.95);
            font-weight: 600;
            color: #1e40af;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        /* Monthly Processing Savings Section - Complete 3-card section matching widget exactly */
        .processing-savings-container {
            background: linear-gradient(to bottom right, #dbeafe, #e0e7ff);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
        }

        .processing-savings-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .processing-savings-header span {
            font-size: 32px;
        }

        .processing-savings-title {
            font-size: 16pt;
            font-weight: 700;
            color: #1e40af;
        }

        .processing-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .processing-card {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            border: 1px solid #e5e7eb;
        }

        .processing-card.current {
            border-color: #fca5a5;
        }

        .processing-card.new {
            border-color: #86efac;
        }

        .processing-card.savings {
            background: linear-gradient(to right, #f0fdf4, #dcfce7);
            border: 2px solid #22c55e;
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .card-title {
            font-size: 11pt;
            font-weight: 500;
            color: #6b7280;
        }

        .card-value-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: space-between;
        }
        
        .card-value-row span:first-child {
            font-size: 28px;
            width: 40px;
        }

        .card-value.current {
            font-size: 24pt;
            font-weight: 700;
            color: #dc2626;
        }

        .card-value.new {
            font-size: 24pt;
            font-weight: 700;
            color: #16a34a;
        }

        .card-value.savings {
            font-size: 24pt;
            font-weight: 800;
            color: #15803d;
        }

        .savings-subtitle {
            font-size: 11pt;
            color: #16a34a;
            font-weight: 500;
            margin-top: 0.25rem;
        }

        /* Annual Impact Section - Match widget exactly */
        .annual-impact {
            margin: 2rem 0;
            padding: 1.5rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .annual-impact-title {
            font-size: 16pt;
            font-weight: 700;
            color: #7c3aed;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .calendar-icon {
            width: 20px;
            height: 20px;
            color: #7c3aed;
        }

        .annual-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .annual-card {
            text-align: center;
            padding: 1rem;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .annual-card-title {
            font-size: 11pt;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }

        .annual-card-amount.savings {
            font-size: 18pt;
            font-weight: 700;
            color: #16a34a;
        }

        .annual-card-amount.volume {
            font-size: 16pt;
            font-weight: 700;
            color: #0369a1;
        }

        .footer {
            margin-top: 3rem;
            text-align: center;
            color: #6b7280;
            font-size: 9pt;
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with ACTUAL DMP Logo -->
        <table style="width: 100%; margin-bottom: 2rem; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: middle; width: 70%;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEBIAEgAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABABIAAAAAEAAQEgAAAAAQAB/+HPqWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuZGJhM2RhMywgMjAyMy8xMi8xMy0wNTowNjo0OSAgICAgICAgIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcEdJbWc9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9nL2ltZy8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6aWxsdXN0cmF0b3I9Imh0dHA6Ly9ucy5hZG9iZS5jb20vaWxsdXN0cmF0b3IvMS4wLyIKICAgICAgICAgICAgeG1sbnM6eG1wVFBnPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvdC9wZy8iCiAgICAgICAgICAgIHhtbG5zOnN0RGltPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvRGltZW5zaW9ucyMiCiAgICAgICAgICAgIHhtbG5zOnhtcEc9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9nLyIKICAgICAgICAgICAgeG1sbnM6cGRmPSJodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvIj4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9qcGVnPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxkYzp0aXRsZT4KICAgICAgICAgICAgPHJkZjpBbHQ+CiAgICAgICAgICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+UHJpbWFyeSBMb2dvPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOkFsdD4KICAgICAgICAgPC9kYzp0aXRsZT4KICAgICAgICAgPHhtcDpNZXRhZGF0YURhdGU+MjAyNC0wMy0yMlQxNTo0Njo0Mi0wNTowMDwveG1wOk1ldGFkYXRhRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjQtMDMtMjJUMjA6NTE6NDJaPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMjQtMDMtMjJUMTU6NDY6NDItMDU6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIElsbHVzdHJhdG9yIDI4LjMgKE1hY2ludG9zaCk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpUaHVtYm5haWxzPgogICAgICAgICAgICA8cmRmOkFsdD4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDx4bXBHSW1nOndpZHRoPjI1NjwveG1wR0ltZzp3aWR0aD4KICAgICAgICAgICAgICAgICAgPHhtcEdJbWc6aGVpZ2h0PjExNjwveG1wR0ltZzpoZWlnaHQ+CiAgICAgICAgICAgICAgICAgIDx4bXBHSW1nOmZvcm1hdD5KUEVHPC94bXBHSW1nOmZvcm1hdD4KICAgICAgICAgICAgICAgICAgPHhtcEdJbWc6aW1hZ2U+LzlqLzRBQVFTa1pKUmdBQkFnRUJJQUVnQUFELzdRQXNVR2h2ZEc5emFHOXdJRE11TUFBNFFrbE5BKzBBQUFBQUFCQUJJQUFBQUFFQSYjeEE7QVFFZ0FBQUFBUUFCLytJTVdFbERRMTlRVWs5R1NVeEZBQUVCQUFBTVNFeHBibThDRUFBQWJXNTBjbEpIUWlCWVdWb2dCODRBQWdBSiYjeEE7QUFZQU1RQUFZV056Y0UxVFJsUUFBQUFBU1VWRElITlNSMElBQUFBQUFBQUFBQUFBQUFBQUFQYldBQUVBQUFBQTB5MUlVQ0FnQUFBQSYjeEE7QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFSWTNCeWRBQUFBVkFBQUFBeiYjeEE7WkdWell3QUFBWVFBQUFCc2QzUndkQUFBQWZBQUFBQVVZbXR3ZEFBQUFnUUFBQUFVY2xoWldnQUFBaGdBQUFBVVoxaFpXZ0FBQWl3QSYjeEE7QUFBVVlsaFpXZ0FBQWtBQUFBQVVaRzF1WkFBQUFsUUFBQUJ3Wkcxa1pBQUFBc1FBQUFDSWRuVmxaQUFBQTB3QUFBQ0dkbWxsZHdBQSYjeEE7QTlRQUFBQWtiSFZ0YVFBQUEvZ0FBQUFVYldWaGN3QUFCQXdBQUFBa2RHVmphQUFBQkRBQUFBQU1jbFJTUXdBQUJEd0FBQWdNWjFSUyYjeEE7UXdBQUJEd0FBQWdNWWxSU1F3QUFCRHdBQUFnTWRHVjRkQUFBQUFCRGIzQjVjbWxuYUhRZ0tHTXBJREU1T1RnZ1NHVjNiR1YwZEMxUSYjeEE7WVdOcllYSmtJRU52YlhCaGJta0FBR1JsYzJNQUFBQUFBQUFBRW5OU1IwSWdTVVZETmpFNU5qWXRNaTR4QUFBQUFBQUFBQUFBQUFBUyYjeEE7YzFKSFFpQkpSVU0yTVRrMk5pMHlMakVBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQSYjeEE7QUFBQUFBQUFBQUFBQUZoWldpQUFBQUFBQUFEelVRQUJBQUFBQVJiTVdGbGFJQUFBQUFBQUFBQUFBQUFBQUFBQUFBQllXVm9nQUFBQSYjeEE7QUFBQWI2SUFBRGoxQUFBRGtGaFpXaUFBQUFBQUFBQmltUUFBdDRVQUFCamFXRmxhSUFBQUFBQUFBQ1NnQUFBUGhBQUF0czlrWlhOaiYjeEE7QUFBQUFBQUFBQlpKUlVNZ2FIUjBjRG92TDNkM2R5NXBaV011WTJnQUFBQUFBQUFBQUFBQUFCWkpSVU1nYUhSMGNEb3ZMM2QzZHk1cCYjeEE7WldNdVkyZ0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFaR1Z6WXdBQSYjeEE7QUFBQUFBQXVTVVZESURZeE9UWTJMVEl1TVNCRVpXWmhkV3gwSUZKSFFpQmpiMng2ZFhJZ2MzQmhZMlVnTFNCelVrZENBQUFBQUFBQSYjeEE7QUFBQUFBQXVTVVZESURZeE9UWTJMVEl1TVNCRVpXWmhkV3gwSUZKSFFpQmpiMngyZFhJZ2MzQmhZMlVnTFNCelVrZENBQUFBQUFBQSYjeEE7QUFBQUFBQUFBQUFBQUFBQUFBQUFBR1JsYzJNQUFBQUFBQUFBTEZKbFptVnlaVzVqWlNCV2FXVjNhVzVuSUVOdmJtUnBkR2x2YmlCcCYjeEE7YmlCSlJVTTJNVGsyTmkweUxqRUFBQUFBQUFBQUFBQUFBQ3hTWldabGNtVnVZMlVnVm1sbGQybHVaeUJEYjI1a2FYUnBiMjRnYVc0ZyYjeEE7U1VWRE5qRTVOall0TWk0eEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCMmFXVjNBQUFBQUFBVHBQNEFGRjh1QUJEUCYjeEE7RkFBRDdjd0FCQk1MQUFOY25nQUFBQUZZV1ZvZ0FBQUFBQUJNQ1ZZQVVBQUFBRmNmNTIxbFlYTUFBQUFBQUFBQUFRQUFBQUFBQUFBQSYjeEE7QUFBQUFBQUFBQUFBQUFKUAAAMmttZk4yMUtMa2kweW8rdGxFelVjdlVYSTZjSFJhcXU3Qzl1b0RnOFJYUVcxQ1N1UiNGdE5ceFhZWFpkR0tiSG5xYVdwYVVyNzl2cGkvK1g3dGY9aXgzL3NQUTQ4NjAwRVJJMEdqOXJQWjh2dGZQKzJsemQ5dmY4NDY2MDA8L3htcEc6aW1hZ2U+CiAgICAgICAgICAgICAgICAgIDx4bXBHSW1nOlhNUDppbnN0YW5jZUlEPSJ4bXAuaWlkOmE0MWM5NjU2LWQzM2EtNDk5Ny05NzFkLTFkMTQ2MmRkNGM5ZCIKICAgICAgICAgICAgICAgICAgPHhtcEdJbWc6RG9jdW1lbnRJRD0ieG1wLmRpZDphNDFjOTY1Ni1kMzNhLTQ5OTctOTcxZC0xZDE0NjJkZDRjOWQiLz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOkFsdD4KICAgICAgICAgPC94bXA6VGh1bWJuYWlscz4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDo1ZGZhNDQyMC0zM2YzLTQ4NDUtOTZhOC04YzM4ODUxMGU3NmE8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6NWRmYTQ0MjAtMzNmMy00ODQ1LTk2YTgtOGMzODg1MTBlNzZhPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnV1aWQ6NWUyN2E5NTMtN2YyZC00MzFiLTg5OTAtOTBiOTE1NmUwNGJjPC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjVkZmE0NDIwLTMzZjMtNDg0NS05NmE4LThjMzg4NTEwZTc2YTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAyNC0wMy0yMlQxNTo0Njo0Mi0wNTowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgSWxsdXN0cmF0b3IgMjguMyAoTWFjaW50b3NoKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8eG1wTU06UmVuZGl0aW9uQ2xhc3M+cHJvb2Y6cGRmPC94bXBNTTpSZW5kaXRpb25DbGFzcz4KICAgICAgICAgPHhtcE1NOkRlcml2ZWRGcm9tIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHN0UmVmOmluc3RhbmNlSUQ+eG1wLmlpZDoyMDFkYWM0Mi1kYzFiLTRjZjUtOGE1Yi1lYzg5YTg0Y2M0Y2E8L3N0UmVmOmluc3RhbmNlSUQ+CiAgICAgICAgICAgIDxzdFJlZjpkb2N1bWVudElEPnhtcC5kaWQ6MjAxZGFjNDItZGMxYi00Y2Y1LThhNWItZWM4OWE4NGNjNGNhPC9zdFJlZjpkb2N1bWVudElEPgogICAgICAgICAgICA8c3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPnV1aWQ6NWUyN2E5NTMtN2YyZC00MzFiLTg5OTAtOTBiOTE1NmUwNGJjPC9zdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgICAgIDxzdFJlZjpyZW5kaXRpb25DbGFzcz5wcm9vZjpwZGY8L3N0UmVmOnJlbmRpdGlvbkNsYXNzPgogICAgICAgICA8L3htcE1NOkRlcml2ZWRGcm9tPgogICAgICAgICA8aWxsdXN0cmF0b3I6VHlwZT5Eb2N1bWVudDwvaWxsdXN0cmF0b3I6VHlwZT4KICAgICAgICAgPGlsbHVzdHJhdG9yOkNyZWF0b3JTdWJUb29sPlNES1Y8L2lsbHVzdHJhdG9yOkNyZWF0b3JTdWJUb29sPgogICAgICAgICA8eG1wVFBnOk5QYWdlcz4xPC94bXBUUGc6TlBhZ2VzPgogICAgICAgICA8eG1wVFBnOkhhc1Zpc2libGVUcmFuc3BhcmVuY3k+RmFsc2U8L3htcFRQZzpIYXNWaXNpYmxlVHJhbnNwYXJlbmN5PgogICAgICAgICA8eG1wVFBnOkhhc1Zpc2libGVPdmVycHJpbnQ+RmFsc2U8L3htcFRQZzpIYXNWaXNpYmxlT3ZlcnByaW50PgogICAgICAgICA8eG1wVFBnOk1heFBhZ2VTaXplIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPHN0RGltOndpZHRoPjEwMTMuNTAwMDAwPC9zdERpbTp3aWR0aD4KICAgICAgICAgICAgPHN0RGltOmhlaWdodD4zNjYuMTMzMzMzPC9zdERpbTpoZWlnaHQ+CiAgICAgICAgICAgIDxzdERpbTp1bml0PkluY2hlczwvc3REaW06dW5pdD4KICAgICAgICAgPC94bXBUUGc6TWF4UGFnZVNpemU+CiAgICAgICAgIDx4bXBUUGc6UGxhdGVOYW1lcz4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGk+Q3lhbjwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpPk1hZ2VudGE8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT5ZZWxsb3c8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT5CbGFjazwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wVFBnOlBsYXRlTmFtZXM+CiAgICAgICAgIDx4bXBUUGc6U3dhcmNoZXM+CiAgICAgICAgICAgIDxyZGY6QmFnPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHhtcEc6dHlwZT5QQURESU5HPC94bXBHOnR5cGU+CiAgICAgICAgICAgICAgICAgIDx4bXBHOmNvbG9yYW50PkM9ODQuMzczNzMyIE09Ny4xNjQwNzkgWT04NC4zMTM3MjUgSz0wLjAwMDAwMDwveG1wRzpjb2xvcmFudD4KICAgICAgICAgICAgICAgICAgPHhtcEc6YXJlYT4xLjQ5OTY4ODwveG1wRzphcmVhPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFy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" 
                             style="width: 120px; height: auto; max-height: 40px;" alt="DMP Logo" />
                        <div>
                            <h1 style="color: #0ea5e9; margin: 0; font-size: 20px; font-weight: 700; font-family: Arial, sans-serif;">Dynamic Merchant Processing</h1>
                            <p style="color: #666666; margin: 0; font-size: 14px; font-style: italic;">Dual Pricing Savings Report</p>
                        </div>
                    </div>
                </td>
                <td style="text-align: right; vertical-align: top; font-size: 12pt; color: #6b7280;">
                    <div style="font-weight: bold;">Report #: SAV{{REPORT_NUMBER}}</div>
                    <div style="font-weight: bold;">Date: {{DATE}}</div>
                </td>
            </tr>
        </table>

        <!-- Customer Information Section -->
        <div class="section">
            <h3 class="section-title">
                <span>👤</span>
                Customer Information
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Business Name</td>
                        <td>{{BUSINESS_NAME}}</td>
                    </tr>
                    <tr>
                        <td>Business Address</td>
                        <td>{{BUSINESS_ADDRESS}}</td>
                    </tr>
                    <tr>
                        <td>Contact Name</td>
                        <td>{{CONTACT_NAME}}</td>
                    </tr>
                    <tr>
                        <td>Contact Email</td>
                        <td>{{CONTACT_EMAIL}}</td>
                    </tr>
                    <tr>
                        <td>Sales Representative</td>
                        <td>{{SALES_REP_NAME}}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Input Parameters -->
        <div class="section">
            <h3 class="section-title">
                <span>⚙️</span>
                Input Parameters
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Monthly Credit Card Volume</td>
                        <td>\${{VOLUME}}</td>
                    </tr>
                    <tr>
                        <td>Current Processing Rate</td>
                        <td>{{CURRENT_RATE}}%</td>
                    </tr>
                    <tr>
                        <td>Interchange Cost</td>
                        <td>{{INTERCHANGE}}%</td>
                    </tr>
                    <tr>
                        <td>Flat Rate Processing</td>
                        <td>{{FLAT_RATE}}%</td>
                    </tr>
                    <tr>
                        <td>Price Differential</td>
                        <td>{{PRICE_DIFF}}%</td>
                    </tr>
                    <tr>
                        <td>Tax Rate</td>
                        <td>{{TAX_RATE}}%</td>
                    </tr>
                    <tr>
                        <td>Tip Rate</td>
                        <td>{{TIP_RATE}}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Volume Breakdown -->
        <div class="section">
            <h3 class="section-title">
                <span>📊</span>
                Volume Breakdown
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Breakdown</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Base Volume</td>
                        <td>\${{BASE_VOLUME}}</td>
                    </tr>
                    <tr>
                        <td>Adjusted Card Volume</td>
                        <td>\${{ADJUSTED_VOLUME}}</td>
                    </tr>
                    <tr>
                        <td>Current Processing Cost</td>
                        <td>\${{CURRENT_COST}}</td>
                    </tr>
                    <tr>
                        <td>New Processing Cost</td>
                        <td>\${{NEW_COST}}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Monthly Processing Savings - Complete 3-card section matching widget exactly -->
        <div class="processing-savings-container" style="page-break-before: always;">
            <div class="processing-savings-header">
                <span>🐷</span>
                <div class="processing-savings-title">Monthly Processing Savings</div>
            </div>
            <div class="processing-cards">
                <!-- Current Processing Cost Card -->
                <div class="processing-card current">
                    <div class="card-header">
                        <span class="card-title">Current Processing Cost</span>
                    </div>
                    <div class="card-value-row">
                        <span>⊖</span>
                        <span class="card-value current">\${{CURRENT_COST_FORMATTED}}</span>
                    </div>
                </div>
                
                <!-- New Processing Cost Card -->
                <div class="processing-card new">
                    <div class="card-header">
                        <span class="card-title">New Processing Cost</span>
                    </div>
                    <div class="card-value-row">
                        <span>✓</span>
                        <span class="card-value new">\${{NEW_COST_FORMATTED}}</span>
                    </div>
                </div>
                
                <!-- Monthly Savings Card -->
                <div class="processing-card savings">
                    <div class="card-header">
                        <span class="card-title">Monthly Savings</span>
                    </div>
                    <div class="card-value-row">
                        <span>🏆</span>
                        <span class="card-value savings">\${{MONTHLY_SAVINGS_FORMATTED}}</span>
                    </div>
                    <div class="savings-subtitle">per month saved with DMP</div>
                </div>
            </div>
        </div>

        <!-- Annual Impact - Styled like other sections -->
        <div class="section" style="margin-top: 2rem;">
            <h3 class="section-title">
                <span>📅</span>
                Annual Impact
            </h3>
            <div class="annual-grid">
                <div class="annual-card">
                    <div class="annual-card-title">Annual Savings</div>
                    <div class="annual-card-amount savings">\${{ANNUAL_SAVINGS_FORMATTED}}</div>
                </div>
                <div class="annual-card">
                    <div class="annual-card-title">Processing Volume</div>
                    <div class="annual-card-amount volume">\${{ANNUAL_VOLUME_FORMATTED}}</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Dynamic Merchant Processing</strong></p>
            <p>Questions? Contact us at info@dmprocessing.com or call (555) 123-4567</p>
        </div>
    </div>
</body>
</html>`;

  // Calculate annual volume (12 months of monthly volume)
  const annualVolume = monthlyVolume * 12;

  // Format currency values with commas
  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Replace placeholders with actual data
  return template
    .replace(/{{REPORT_NUMBER}}/g, reportNumber)
    .replace(/{{DATE}}/g, currentDate)
    .replace(/{{CURRENT_COST}}/g, currentCost.toFixed(2))
    .replace(/{{NEW_COST}}/g, newCost < 0 ? Math.abs(newCost).toFixed(2) : newCost.toFixed(2))
    .replace(/{{MONTHLY_SAVINGS}}/g, Math.abs(monthlySavings).toFixed(2))
    .replace(/{{CURRENT_COST_FORMATTED}}/g, formatCurrency(currentCost))
    .replace(/{{NEW_COST_FORMATTED}}/g, formatCurrency(newCost))
    .replace(/{{MONTHLY_SAVINGS_FORMATTED}}/g, formatCurrency(monthlySavings))
    .replace(/{{ANNUAL_SAVINGS_FORMATTED}}/g, formatCurrency(annualSavings))
    .replace(/{{ANNUAL_VOLUME_FORMATTED}}/g, annualVolume.toLocaleString('en-US'))
    .replace(/{{VOLUME}}/g, monthlyVolume.toLocaleString())
    .replace(/{{CURRENT_RATE}}/g, currentRate.toFixed(2))
    .replace(/{{INTERCHANGE}}/g, interchangeCost.toFixed(2))
    .replace(/{{FLAT_RATE}}/g, flatRate.toFixed(2))
    .replace(/{{PRICE_DIFF}}/g, priceDifferential.toFixed(2))
    .replace(/{{TAX_RATE}}/g, taxRate.toFixed(2))
    .replace(/{{TIP_RATE}}/g, tipRate.toFixed(2))
    .replace(/{{BASE_VOLUME}}/g, baseVolume.toLocaleString())
    .replace(/{{ADJUSTED_VOLUME}}/g, adjustedVolume.toLocaleString())
    .replace(/{{ANNUAL_SAVINGS}}/g, annualSavings.toFixed(2))
    .replace(/{{ANNUAL_VOLUME}}/g, annualVolume.toLocaleString())
    .replace(/{{BUSINESS_NAME}}/g, businessName || customerInfo.businessName || 'Not Provided')
    .replace(/{{BUSINESS_ADDRESS}}/g, businessAddress || customerInfo.businessAddress || 'Not Provided')
    .replace(/{{CONTACT_NAME}}/g, contactName || customerInfo.contactName || 'Not Provided')
    .replace(/{{CONTACT_EMAIL}}/g, contactEmail || customerInfo.contactEmail || 'Not Provided')
    .replace(/{{SALES_REP_NAME}}/g, salesRepName || customerInfo.salesRepName || 'Not Provided');
}

export { generateQuoteStyleHTML };