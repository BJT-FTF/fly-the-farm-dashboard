import jsPDF from 'jspdf';
import { JobActual, CostLineItem } from '../types/financials';
import { getClientById } from '../services/fieldManagementStore';
import { getKitById, getQuoteById, getQuoteConfig } from '../services/quoteStore';

const PRIMARY = [30, 77, 43]; // dark green
const GREY = [100, 100, 100];
const LIGHT_GREY = [200, 200, 200];
const BLACK = [33, 33, 33];
const GREEN = [46, 125, 50];
const ORANGE = [230, 81, 0];
const RED = [198, 40, 40];

function fmt(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function marginColor(m: number): number[] {
  if (m >= 40) return GREEN;
  if (m >= 20) return ORANGE;
  return RED;
}

export interface ReportOptions {
  includePnL: boolean;
}

export function generateActualReport(actual: JobActual, options: ReportOptions = { includePnL: true }): void {
  const { includePnL } = options;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const setColor = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const drawLine = (yPos: number) => {
    doc.setDrawColor(LIGHT_GREY[0], LIGHT_GREY[1], LIGHT_GREY[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageW - margin, yPos);
  };

  const checkPage = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = margin;
    }
  };

  // ─── Business header ──────────────────────────────
  const config = getQuoteConfig(actual.contractorUserId);
  if (config && config.businessName) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    setColor(PRIMARY);
    doc.text(config.businessName, margin, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(GREY);
    const details: string[] = [];
    if (config.businessABN) details.push(`ABN: ${config.businessABN}`);
    if (config.businessPhone) details.push(config.businessPhone);
    if (config.businessEmail) details.push(config.businessEmail);
    if (details.length) {
      doc.text(details.join('  |  '), margin, y);
      y += 4;
    }
    if (config.businessAddress) {
      doc.text(config.businessAddress, margin, y);
      y += 4;
    }
  }

  // ─── Report title ─────────────────────────────────
  y += 4;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(BLACK);
  doc.text(includePnL ? 'Job Actual Report' : 'Job Summary Report', margin, y);
  y += 7;

  drawLine(y);
  y += 6;

  // ─── Job details ──────────────────────────────────
  const client = actual.clientId ? getClientById(actual.clientId) : undefined;

  const startFmt = new Date(actual.startDate + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const endFmt = new Date(actual.endDate + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const dateStr = actual.startDate === actual.endDate
    ? startFmt
    : `${startFmt} – ${endFmt}`;

  const infoRows: [string, string][] = [
    ['Title', actual.title],
    ['Client', client?.name || '—'],
    ['Date', dateStr],
    ['Duration', `${actual.totalDays} day${actual.totalDays !== 1 ? 's' : ''} · ${actual.totalHours} hours`],
    ['Status', actual.status.charAt(0).toUpperCase() + actual.status.slice(1)],
  ];

  if (includePnL && actual.rate > 0) {
    const rateLabel = actual.rateType === 'hourly' ? '/hr' : '/ha';
    infoRows.push(['Rate', `${fmt(actual.rate)}${rateLabel}`]);
    if (actual.rateType === 'hectare' && actual.hectares) {
      infoRows.push(['Hectares', String(actual.hectares)]);
    }
    infoRows.push(['Effective $/hr', fmt(actual.effectiveHourlyRate)]);
  }

  doc.setFontSize(9);
  for (const [label, value] of infoRows) {
    doc.setFont('helvetica', 'bold');
    setColor(GREY);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    setColor(BLACK);
    doc.text(value, margin + 40, y);
    y += 5;
  }

  y += 4;
  drawLine(y);
  y += 6;

  // ─── P&L Summary ─────────────────────────────────
  if (includePnL) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setColor(PRIMARY);
    doc.text('Profit & Loss Summary', margin, y);
    y += 8;

    const plRows: [string, string, number[]][] = [
      ['Revenue', fmt(actual.revenue), [25, 118, 210]],
      ['Total Cost', fmt(actual.totalCost), ORANGE],
      ['Gross Profit', fmt(actual.grossProfit), actual.grossProfit >= 0 ? GREEN : RED],
      ['Gross Margin', `${actual.grossMarginPercent.toFixed(1)}%`, marginColor(actual.grossMarginPercent)],
    ];

    doc.setFontSize(10);
    for (const [label, value, color] of plRows) {
      doc.setFont('helvetica', 'normal');
      setColor(GREY);
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'bold');
      setColor(color);
      doc.text(value, margin + contentW, y, { align: 'right' });
      y += 6;
    }

    y += 4;
    drawLine(y);
    y += 6;
  }

  // ─── Daily Hours ──────────────────────────────────
  if (actual.dailyHours && actual.dailyHours.length > 1) {
    checkPage(30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(PRIMARY);
    doc.text('Daily Hours', margin, y);
    y += 6;

    doc.setFontSize(9);
    for (const entry of actual.dailyHours) {
      checkPage(6);
      const dayStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-AU', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
      doc.setFont('helvetica', 'normal');
      setColor(GREY);
      doc.text(dayStr, margin + 4, y);
      doc.setFont('helvetica', 'bold');
      setColor(BLACK);
      doc.text(`${entry.hours} hrs`, margin + contentW, y, { align: 'right' });
      y += 5;
    }

    drawLine(y);
    y += 3;
    doc.setFont('helvetica', 'bold');
    setColor(PRIMARY);
    doc.text('Total', margin + 4, y);
    doc.text(`${actual.totalHours} hrs`, margin + contentW, y, { align: 'right' });
    y += 6;

    drawLine(y);
    y += 6;
  }

  // ─── Cost breakdowns (only with P&L) ─────────────
  if (includePnL) {
    const addCostSection = (title: string, rows: [string, string][], total: number) => {
      if (rows.length === 0 && total === 0) return;
      checkPage(20 + rows.length * 5);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setColor(PRIMARY);
      doc.text(title, margin, y);
      doc.setFont('helvetica', 'bold');
      setColor(BLACK);
      doc.text(fmt(total), margin + contentW, y, { align: 'right' });
      y += 6;

      doc.setFontSize(9);
      for (const [label, value] of rows) {
        checkPage(6);
        doc.setFont('helvetica', 'normal');
        setColor(GREY);
        doc.text(label, margin + 4, y);
        doc.setFont('helvetica', 'normal');
        setColor(BLACK);
        doc.text(value, margin + contentW, y, { align: 'right' });
        y += 5;
      }

      y += 4;
    };

    const lineItemRows = (items: CostLineItem[]): [string, string][] =>
      items.map((i) => [
        i.description + (i.quantity > 1 ? ` (${i.quantity} ${i.unitLabel})` : ''),
        fmt(i.total),
      ]);

    // ─── Equipment ────────────────────────────────────
    const kitNames = actual.equipment.kitSelections
      .map((sel) => {
        const kit = getKitById(sel.kitId);
        return kit ? `${kit.name} x${sel.quantity}` : `Kit x${sel.quantity}`;
      })
      .join(', ');

    const equipRows: [string, string][] = [];
    if (kitNames) equipRows.push(['Kits', kitNames]);
    if (actual.equipment.actualFlightHours > 0) {
      equipRows.push(['Flight Hours', `${actual.equipment.actualFlightHours} hrs`]);
    }
    equipRows.push(['Fuel', fmt(actual.equipment.fuelTotal)]);
    equipRows.push(...lineItemRows(actual.equipment.fuelBreakdown));
    addCostSection('Equipment', equipRows, actual.equipment.fuelTotal);

    // ─── Labour ───────────────────────────────────────
    const pilotTotal = actual.labour.pilotCount * actual.labour.pilotHours * actual.labour.pilotRatePerHour;
    const chemOpTotal = actual.labour.hasChemOperator
      ? actual.labour.chemOpHours * actual.labour.chemOpRatePerHour
      : 0;
    const labourTotal = pilotTotal + chemOpTotal + actual.labour.additionalLabour.reduce((s, i) => s + i.total, 0);

    const labourRows: [string, string][] = [
      [
        `${actual.labour.pilotCount} pilot${actual.labour.pilotCount !== 1 ? 's' : ''} × ${actual.labour.pilotHours} hrs @ ${fmt(actual.labour.pilotRatePerHour)}/hr`,
        fmt(pilotTotal),
      ],
    ];
    if (actual.labour.hasChemOperator) {
      labourRows.push([
        `Chem Operator × ${actual.labour.chemOpHours} hrs @ ${fmt(actual.labour.chemOpRatePerHour)}/hr`,
        fmt(chemOpTotal),
      ]);
    }
    labourRows.push(...lineItemRows(actual.labour.additionalLabour));
    addCostSection('Labour', labourRows, labourTotal);

    // ─── Travel ───────────────────────────────────────
    const travelTotal = actual.travel.vehicleTotal + actual.travel.accommodation + actual.travel.meals;
    const travelRows: [string, string][] = [];
    if (actual.travel.kilometres > 0) {
      travelRows.push([
        `${actual.travel.kilometres} km @ ${fmt(actual.travel.vehicleCostPerKm)}/km`,
        fmt(actual.travel.vehicleTotal),
      ]);
    }
    if (actual.travel.accommodation > 0) {
      travelRows.push(['Accommodation', fmt(actual.travel.accommodation)]);
      travelRows.push(...lineItemRows(actual.travel.accommodationBreakdown));
    }
    if (actual.travel.meals > 0) {
      travelRows.push(['Meals', fmt(actual.travel.meals)]);
      travelRows.push(...lineItemRows(actual.travel.mealsBreakdown));
    }
    addCostSection('Travel & Accommodation', travelRows, travelTotal);

    // ─── Chemicals ────────────────────────────────────
    if (actual.chemicalCost > 0) {
      addCostSection('Chemicals', [['Chemical Cost', fmt(actual.chemicalCost)]], actual.chemicalCost);
    }

    // ─── Repairs ──────────────────────────────────────
    if (actual.repairs.items.length > 0) {
      const repairTotal = actual.repairs.items.reduce((s, i) => s + i.total, 0);
      addCostSection('Repairs', lineItemRows(actual.repairs.items), repairTotal);
    }

    // ─── Other Costs ──────────────────────────────────
    if (actual.otherCosts.items.length > 0) {
      const otherTotal = actual.otherCosts.items.reduce((s, i) => s + i.total, 0);
      addCostSection('Other Costs', lineItemRows(actual.otherCosts.items), otherTotal);
    }

    // ─── Quote Comparison ─────────────────────────────
    const quote = actual.quoteId ? getQuoteById(actual.quoteId) : undefined;
    if (quote && quote.margin) {
      checkPage(40);
      drawLine(y);
      y += 6;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setColor(PRIMARY);
      doc.text('Quote vs Actual Comparison', margin, y);
      y += 7;

      // Table header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(GREY);
      const col1 = margin;
      const col2 = margin + 50;
      const col3 = margin + 90;
      const col4 = margin + 130;
      doc.text('Category', col1, y);
      doc.text('Quoted', col2, y, { align: 'right' });
      doc.text('Actual', col3, y, { align: 'right' });
      doc.text('Variance', col4, y, { align: 'right' });
      y += 2;
      drawLine(y);
      y += 5;

      const compRows: { label: string; quoted: number; actual: number; isPercent: boolean; higherBetter: boolean }[] = [
        { label: 'Revenue', quoted: quote.margin.revenue, actual: actual.revenue, isPercent: false, higherBetter: true },
        { label: 'Total Cost', quoted: quote.margin.totalCost, actual: actual.totalCost, isPercent: false, higherBetter: false },
        { label: 'Margin %', quoted: quote.margin.grossMarginPercent, actual: actual.grossMarginPercent, isPercent: true, higherBetter: true },
      ];

      doc.setFontSize(9);
      for (const row of compRows) {
        const variance = row.actual - row.quoted;
        const isBetter = row.higherBetter ? variance >= 0 : variance <= 0;

        doc.setFont('helvetica', 'normal');
        setColor(BLACK);
        doc.text(row.label, col1, y);
        setColor(GREY);
        doc.text(row.isPercent ? `${row.quoted.toFixed(1)}%` : fmt(row.quoted), col2, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        setColor(BLACK);
        doc.text(row.isPercent ? `${row.actual.toFixed(1)}%` : fmt(row.actual), col3, y, { align: 'right' });
        setColor(isBetter ? GREEN : RED);
        const sign = variance >= 0 ? '+' : '';
        doc.text(
          row.isPercent ? `${sign}${variance.toFixed(1)}%` : `${sign}${fmt(variance).replace('$-', '-$')}`,
          col4, y, { align: 'right' },
        );
        y += 6;
      }
      y += 4;
    }
  }

  // ─── Notes ────────────────────────────────────────
  if (actual.notes || actual.lessonsLearned) {
    checkPage(30);
    drawLine(y);
    y += 6;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(PRIMARY);
    doc.text('Notes', margin, y);
    y += 6;

    doc.setFontSize(9);
    if (actual.notes) {
      doc.setFont('helvetica', 'bold');
      setColor(GREY);
      doc.text('General Notes', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      setColor(BLACK);
      const noteLines = doc.splitTextToSize(actual.notes, contentW - 4);
      for (const line of noteLines) {
        checkPage(5);
        doc.text(line, margin + 4, y);
        y += 4;
      }
      y += 3;
    }

    if (actual.lessonsLearned) {
      doc.setFont('helvetica', 'bold');
      setColor(GREY);
      doc.text('Lessons Learned', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      setColor(BLACK);
      const lessonLines = doc.splitTextToSize(actual.lessonsLearned, contentW - 4);
      for (const line of lessonLines) {
        checkPage(5);
        doc.text(line, margin + 4, y);
        y += 4;
      }
    }
  }

  // ─── Footer ───────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setColor(LIGHT_GREY);
    doc.text(
      `Generated ${new Date().toLocaleDateString('en-AU')} · Page ${i} of ${pageCount}`,
      pageW / 2, 290,
      { align: 'center' },
    );
  }

  // ─── Save ─────────────────────────────────────────
  const safeName = actual.title.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');
  const suffix = includePnL ? 'Full' : 'Summary';
  doc.save(`Actual-Report-${safeName}-${suffix}.pdf`);
}
