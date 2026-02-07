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
  doc.rect(0, 0, W, 3, 'F');

  // --- Header section ---
  y = 12;
  doc.setFillColor(...COLORS.panelBg);
  doc.rect(0, 6, W, 42, 'F');

  // Name
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('TANIA SALVATELLA', 15, y + 10);

  // Title
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.premiere);
  doc.text(t.job_title.toUpperCase(), 15, y + 18);

  // Contact info on right
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  const contactX = 140;
  doc.text('tsalvatellap@gmail.com', contactX, y + 5);
  doc.text('650 08 36 22', contactX, y + 9);
  doc.text('linkedin.com/in/taniasalvatella', contactX, y + 13);
  doc.text('Madrid, España', contactX, y + 17);

  // Mode indicators
  const modeY = y + 26;
  doc.setFontSize(6);
  const modes = [
    { label: lang === 'es' ? 'EDICIÓN' : 'EDITING', color: COLORS.premiere },
    { label: lang === 'es' ? 'EFECTOS' : 'EFFECTS', color: COLORS.aftereffects },
    { label: 'COLOR', color: COLORS.davinci },
  ];
  modes.forEach((mode, i) => {
    const mx = 15 + i * 30;
    doc.setFillColor(...mode.color);
    doc.rect(mx, modeY, 25, 5, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(mode.label, mx + 12.5, modeY + 3.5, { align: 'center' });
  });

  // --- Phrase ---
  y = 55;
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`"${t.phrases[0]}"`, W / 2, y, { align: 'center' });

  // --- EXPERIENCE section ---
  y = 65;
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 3, W, 8, 'F');
  doc.setTextColor(...COLORS.premiere);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ EXPERIENCIA PROFESIONAL' : '▶ PROFESSIONAL EXPERIENCE', 15, y + 2);

  // Timecode decoration
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(6);
  doc.text('00:00:00:00', W - 35, y + 2);

  y += 12;

  const expColors = [COLORS.accent2, COLORS.accent3, COLORS.accent4];
  t.exp_data.forEach((exp, idx) => {
    // Experience header bar
    doc.setFillColor(...expColors[idx % expColors.length]);
    doc.rect(15, y - 1, 2, 6, 'F');

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title.toUpperCase(), 20, y + 2);

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.text(`${exp.company}  |  ${exp.period}`, 20, y + 6);

    y += 10;

    // History entries
    exp.fullHistory.forEach((item) => {
      if (y > 270) {
        addNewPage(doc);
        y = 15;
      }

      // Year badge
      doc.setFillColor(...COLORS.headerBg);
      doc.roundedRect(20, y - 2, 22, 5, 1, 1, 'F');
      doc.setTextColor(...COLORS.premiere);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(item.year, 31, y + 1.5, { align: 'center' });

      // Label
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, 45, y + 1.5);

      y += 5;

      // Description
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(item.desc, 140);
      doc.text(lines, 20, y + 1);
      y += lines.length * 3.5 + 3;
    });

    y += 4;
  });

  // --- EDUCATION section ---
  if (y > 235) {
    addNewPage(doc);
    y = 15;
  }

  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 3, W, 8, 'F');
  doc.setTextColor(...COLORS.emerald);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ EDUCACIÓN' : '▶ EDUCATION', 15, y + 2);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(6);
  doc.text('COMP: Education.comp', W - 50, y + 2);

  y += 12;

  t.edu_data.forEach((edu) => {
    if (y > 275) {
      addNewPage(doc);
      y = 15;
    }

    // Year
    doc.setFillColor(...COLORS.premiere);
    doc.rect(15, y - 1, 2, 5, 'F');
    doc.setTextColor(...COLORS.premiere);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.year, 20, y + 2);

    // Label
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.label, 35, y + 2);

    y += 9;
  });

  // --- TECH SKILLS section ---
  if (y > 220) {
    addNewPage(doc);
    y = 15;
  }

  y += 5;
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 3, W, 8, 'F');
  doc.setTextColor(...COLORS.davinci);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ PIPELINE TECNOLÓGICO' : '▶ TECH PIPELINE', 15, y + 2);

  y += 12;

  // Skills in two columns
  const colW = 85;
  t.techSkills.forEach((skill, idx) => {
    if (y > 275) {
      addNewPage(doc);
      y = 15;
    }
    const col = idx % 2;
    const sx = 15 + col * colW;
    const sy = y;

    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(skill.n, sx, sy);

    doc.setTextColor(...COLORS.davinci);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(skill.v, sx + 55, sy);

    // Progress bar
    const barW = skill.v === 'EXPERT' || skill.v === 'EXPERTO' ? 55 : skill.v === 'PRO' ? 48 : 40;
    doc.setFillColor(...COLORS.headerBg);
    doc.rect(sx, sy + 1.5, 60, 1.5, 'F');
    doc.setFillColor(...COLORS.davinci);
    doc.rect(sx, sy + 1.5, barW, 1.5, 'F');

    if (col === 1) y += 8;
  });
  if (t.techSkills.length % 2 !== 0) y += 8;

  // --- GEN-AI section ---
  y += 5;
  doc.setTextColor(...COLORS.aftereffects);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`✦ ${t.genAiEngine.toUpperCase()}`, 15, y);

  y += 5;
  t.genAiModels.forEach((model, idx) => {
    const col = idx % 3;
    const mx = 15 + col * 30;
    doc.setFillColor(40, 30, 50);
    doc.roundedRect(mx, y, 26, 5, 1, 1, 'F');
    doc.setTextColor(...COLORS.aftereffects);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(model, mx + 13, y + 3.5, { align: 'center' });
    if (col === 2) y += 7;
  });

  // --- SOFT SKILLS section ---
  y += 12;
  if (y > 260) {
    addNewPage(doc);
    y = 15;
  }

  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, y - 3, W, 8, 'F');
  doc.setTextColor(...COLORS.emerald);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'es' ? '▶ SOFT SKILLS / METADATA' : '▶ SOFT SKILLS / METADATA', 15, y + 2);

  y += 12;
  const softSkillsData = [
    { label: t.soft_skills.english, value: t.skill_levels.weak },
    { label: t.soft_skills.creativity, value: t.skill_levels.native },
    { label: t.soft_skills.team, value: t.skill_levels.love },
    { label: t.soft_skills.comm, value: t.skill_levels.high },
    { label: t.soft_skills.adapt, value: t.skill_levels.shifts },
  ];

  softSkillsData.forEach((skill) => {
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(skill.label, 15, y);

    doc.setTextColor(...COLORS.emerald);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(skill.value, 80, y);

    y += 6;
  });

  // --- Footer ---
  y = H - 15;
  doc.setFillColor(...COLORS.panelBg);
  doc.rect(0, y - 2, W, 17, 'F');

  doc.setFillColor(...COLORS.premiere);
  doc.rect(0, H - 2, W, 2, 'F');

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(6);
  doc.text('SYSTEM: RENDER COMPLETE  |  GPU: Mercury Engine (Metal)  |  FORMAT: PDF/A4  |  FPS: 23.976', W / 2, y + 3, { align: 'center' });

  doc.setTextColor(...COLORS.premiere);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TANIA SALVATELLA  —  CV 2026', W / 2, y + 8, { align: 'center' });

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(5);
  doc.text(lang === 'es' ? 'Generado desde CV Interactivo — Pro-Tool Metafor' : 'Generated from Interactive CV — Pro-Tool Metaphor', W / 2, y + 12, { align: 'center' });

  // Save
  doc.save(`CV_Tania_Salvatella_${lang.toUpperCase()}.pdf`);
};

function addNewPage(doc: jsPDF) {
  doc.addPage();
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(...COLORS.premiere);
  doc.rect(0, 0, 210, 1.5, 'F');
}
