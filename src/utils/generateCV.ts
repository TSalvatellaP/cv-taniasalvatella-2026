import jsPDF from 'jspdf';
import { translations } from '@/data/translations';

const COLORS = {
  bg: [26, 26, 26] as [number, number, number],
  panelBg: [45, 45, 45] as [number, number, number],
  headerBg: [29, 29, 29] as [number, number, number],
  white: [230, 230, 230] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  premiere: [49, 168, 255] as [number, number, number],
  aftereffects: [209, 145, 255] as [number, number, number],
  davinci: [243, 156, 18] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
  accent2: [213, 128, 165] as [number, number, number],
  accent3: [94, 124, 157] as [number, number, number],
  accent4: [123, 102, 157] as [number, number, number],
};

export const generateCV = (lang: 'es' | 'en') => {
  const t = translations[lang];
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  let y = 0;

  // --- Background ---
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, W, H, 'F');

  // --- Top accent bar ---
  doc.setFillColor(...COLORS.premiere);
  doc.rect(0, 0, W, 2.5, 'F');

  // --- Header section ---
  y = 10;
  doc.setFillColor(...COLORS.panelBg);
  doc.rect(0, 5, W, 30, 'F');

  // Name
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TANIA SALVATELLA', 12, y + 6);

  // Title
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.premiere);
  doc.text(t.job_title.toUpperCase(), 12, y + 12);

  // Contact info on right
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.muted);
  const contactX = 145;
  doc.text('tsalvatellap@gmail.com', contactX, y + 3);
  doc.text('650 08 36 22', contactX, y + 7);
  doc.text('linkedin.com/in/taniasalvatella', contactX, y + 11);
  doc.text('Madrid, España', contactX, y + 15);

  // Mode indicators
  const modeY = y + 18;
  doc.setFontSize(5.5);
  const modes = [
    { label: lang === 'es' ? 'EDICIÓN' : 'EDITING', color: COLORS.premiere },
    { label: lang === 'es' ? 'EFECTOS' : 'EFFECTS', color: COLORS.aftereffects },
    { label: 'COLOR', color: COLORS.davinci },
  ];
  modes.forEach((mode, i) => {
    const mx = 12 + i * 25;
    doc.setFillColor(...mode.color);
    doc.rect(mx, modeY, 22, 4, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(mode.label, mx + 11, modeY + 2.8, { align: 'center' });
  });

  // --- EXPERIENCE section ---
  y = 40;
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 2, W, 6, 'F');
  doc.setTextColor(...COLORS.premiere);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ EXPERIENCIA PROFESIONAL' : '▶ PROFESSIONAL EXPERIENCE', 12, y + 1.5);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(5);
  doc.text('00:00:00:00', W - 30, y + 1.5);

  y += 8;

  const expColors = [COLORS.accent2, COLORS.accent3, COLORS.accent4];
  t.exp_data.forEach((exp, idx) => {
    // Experience header
    doc.setFillColor(...expColors[idx % expColors.length]);
    doc.rect(12, y - 0.5, 1.5, 4.5, 'F');

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title.toUpperCase(), 16, y + 1.5);

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(6);
    doc.text(`${exp.company}  |  ${exp.period}`, 16, y + 5);
    y += 7;

    // Condensed: show only key entries (max 3, short desc)
    const entries = exp.fullHistory.slice(0, 3);
    entries.forEach((item) => {
      // Year + Label on one line
      doc.setTextColor(...COLORS.premiere);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(item.year, 16, y + 1);
      
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(6);
      doc.text(item.label, 38, y + 1);
      
      // Short description
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      const shortDesc = item.desc.length > 80 ? item.desc.substring(0, 77) + '...' : item.desc;
      doc.text(shortDesc, 16, y + 4.5);
      y += 7;
    });

    y += 2;
  });

  // --- EDUCATION section ---
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 2, W, 6, 'F');
  doc.setTextColor(...COLORS.emerald);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ EDUCACIÓN' : '▶ EDUCATION', 12, y + 1.5);

  y += 8;

  // Education in two columns for space saving
  const eduColW = 90;
  t.edu_data.forEach((edu, idx) => {
    const col = idx % 2;
    const ex = 12 + col * eduColW;
    const ey = y + Math.floor(idx / 2) * 6;

    doc.setFillColor(...COLORS.premiere);
    doc.rect(ex, ey - 0.5, 1.5, 4, 'F');
    doc.setTextColor(...COLORS.premiere);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.year, ex + 3, ey + 2);

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(6);
    doc.text(edu.label, ex + 14, ey + 2);
  });
  y += Math.ceil(t.edu_data.length / 2) * 6 + 4;

  // --- TECH SKILLS section (two columns) ---
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 2, W, 6, 'F');
  doc.setTextColor(...COLORS.davinci);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ PIPELINE TECNOLÓGICO' : '▶ TECH PIPELINE', 12, y + 1.5);

  y += 8;

  const colW = 90;
  t.techSkills.forEach((skill, idx) => {
    const col = idx % 2;
    const sx = 12 + col * colW;
    const sy = y + Math.floor(idx / 2) * 5.5;

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(skill.n, sx, sy);

    doc.setTextColor(...COLORS.davinci);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(skill.v, sx + 45, sy);

    // Mini progress bar
    const barW = skill.v === 'EXPERT' || skill.v === 'EXPERTO' ? '95' : skill.v === 'PRO' ? '85' : skill.v === 'MID' ? '70' : '50';
    doc.setFillColor(...COLORS.headerBg);
    doc.rect(sx, sy + 1, 50, 1, 'F');
    doc.setFillColor(...COLORS.davinci);
    doc.rect(sx, sy + 1, parseFloat(barW) / 100 * 50, 1, 'F');
  });
  y += Math.ceil(t.techSkills.length / 2) * 5.5 + 3;

  // --- GEN-AI section ---
  doc.setTextColor(...COLORS.aftereffects);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`✦ ${t.genAiEngine.toUpperCase()}`, 12, y);

  y += 4;
  t.genAiModels.forEach((model, idx) => {
    const col = idx % 4;
    const mx = 12 + col * 24;
    const my = y + Math.floor(idx / 4) * 5;
    doc.setFillColor(40, 30, 50);
    doc.roundedRect(mx, my, 22, 4, 1, 1, 'F');
    doc.setTextColor(...COLORS.aftereffects);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(model, mx + 11, my + 2.8, { align: 'center' });
  });
  y += Math.ceil(t.genAiModels.length / 4) * 5 + 4;

  // --- BROADCAST SYSTEMS ---
  doc.setTextColor(...COLORS.emerald);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`▶ ${t.broadcastSys.toUpperCase()}`, 12, y);
  y += 4;

  let bx = 12;
  t.broadcastSystemsList.forEach((sys) => {
    const tw = doc.getTextWidth(sys) + 4;
    if (bx + tw > W - 12) { bx = 12; y += 5; }
    doc.setFillColor(...COLORS.headerBg);
    doc.roundedRect(bx, y - 1, tw, 4, 0.5, 0.5, 'F');
    doc.setTextColor(...COLORS.emerald);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text(sys, bx + 2, y + 1.5);
    bx += tw + 2;
  });
  y += 7;

  // --- SOFT SKILLS section ---
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 2, W, 6, 'F');
  doc.setTextColor(...COLORS.emerald);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ SOFT SKILLS / METADATA' : '▶ SOFT SKILLS / METADATA', 12, y + 1.5);

  y += 8;
  const softSkillsData = [
    { label: t.soft_skills.english, value: t.skill_levels.weak },
    { label: t.soft_skills.creativity, value: t.skill_levels.native },
    { label: t.soft_skills.team, value: t.skill_levels.love },
    { label: t.soft_skills.comm, value: t.skill_levels.high },
    { label: t.soft_skills.adapt, value: t.skill_levels.shifts },
  ];

  // Two columns for soft skills
  softSkillsData.forEach((skill, idx) => {
    const col = idx % 2;
    const sx = 12 + col * 95;
    const sy = y + Math.floor(idx / 2) * 5;

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(skill.label, sx, sy);

    doc.setTextColor(...COLORS.emerald);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(skill.value, sx + 40, sy);
  });
  y += Math.ceil(softSkillsData.length / 2) * 5 + 2;

  // --- Footer ---
  const footerY = H - 12;
  doc.setFillColor(...COLORS.panelBg);
  doc.rect(0, footerY - 2, W, 14, 'F');

  doc.setFillColor(...COLORS.premiere);
  doc.rect(0, H - 2, W, 2, 'F');

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(5);
  doc.text('SYSTEM: RENDER COMPLETE  |  GPU: Mercury Engine (Metal)  |  FORMAT: PDF/A4  |  FPS: 23.976', W / 2, footerY + 2, { align: 'center' });

  doc.setTextColor(...COLORS.premiere);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TANIA SALVATELLA  —  CV 2026', W / 2, footerY + 6, { align: 'center' });

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(4.5);
  doc.text(lang === 'es' ? 'Generado desde CV Interactivo — Pro-Tool Metafor' : 'Generated from Interactive CV — Pro-Tool Metaphor', W / 2, footerY + 9.5, { align: 'center' });

  // Save
  doc.save(`CV_Tania_Salvatella_${lang.toUpperCase()}.pdf`);
};
