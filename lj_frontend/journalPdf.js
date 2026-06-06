function generateJournalPDF(entry) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const margin = 14;
  const colW = 88;
  const leftX = margin;
  const rightX = margin + colW + 6;
  const labelColor = [40, 62, 81];
  const textColor = [51, 51, 51];
  const bottomMargin = 20;

  let y = margin;

  function ensureSpaceAt(pos, needed) {
    if (pos + needed > 297 - bottomMargin) {
      doc.addPage();
      return margin;
    }
    return pos;
  }

  function drawTitle() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...labelColor);
    doc.text("Weekly Journal Entry", pageW / 2, y, { align: "center" });
    y += 12;
  }

  function measureField(value, width, minHeight) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(value || "-", width - 4);
    const lineH = 4.2;
    const boxH = Math.max(minHeight, lines.length * lineH + 4);
    return { lines, boxH };
  }

  function drawField(x, startY, width, label, value, minHeight = 8) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...labelColor);
    doc.text(label, x, startY);

    const { lines, boxH } = measureField(value, width, minHeight);
    const boxY = startY + 4;

    doc.setDrawColor(204, 204, 204);
    doc.setFillColor(249, 249, 249);
    doc.roundedRect(x, boxY, width, boxH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text(lines, x + 2, boxY + 5);

    return startY + 4 + boxH + 5;
  }

  function parseDates(weekRange) {
    if (!weekRange || !weekRange.includes(" - ")) return { start: "-", end: "-" };
    const [start, end] = weekRange.split(" - ");
    return { start: start.trim(), end: end.trim() };
  }

  drawTitle();

  const { start, end } = parseDates(entry.weekRange);
  const sectionStartY = y;

  const leftFields = [
    { label: "Week Number *", value: String(entry.week ?? "-"), minH: 8 },
    { label: "Start Date *", value: start, minH: 8 },
    { label: "End Date *", value: end, minH: 8 },
    { label: "Course Code *", value: entry.courseCode, minH: 8 },
    { label: "Course Name *", value: entry.courseName, minH: 8 },
    { label: "Module *", value: entry.module, minH: 8 },
  ];

  const rightFields = [
    { label: "Topics Covered *", value: entry.topics, minH: 18 },
    { label: "Key Terms Learnt *", value: entry.keyTerms, minH: 14 },
    { label: "Summary of Learning *", value: entry.summary, minH: 18 },
    { label: "Doubts / Clarifications Needed *", value: entry.doubts, minH: 14 },
    { label: "How I Covered Missed Content *", value: entry.makeup, minH: 14 },
  ];

  let leftY = sectionStartY;
  leftFields.forEach((field) => {
    leftY = ensureSpaceAt(leftY, 20);
    leftY = drawField(leftX, leftY, colW, field.label, field.value, field.minH);
  });

  let rightY = sectionStartY;
  rightFields.forEach((field) => {
    rightY = ensureSpaceAt(rightY, 25);
    rightY = drawField(rightX, rightY, colW, field.label, field.value, field.minH);
  });

  y = Math.max(leftY, rightY) + 4;

  y = ensureSpaceAt(y, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...labelColor);
  doc.text("Student Info", margin, y);
  y += 8;

  const studentW = (pageW - margin * 2 - 9) / 4;
  const studentFields = [
    { label: "USN *", value: entry.usn },
    { label: "Name *", value: entry.studentName },
    { label: "Semester *", value: entry.semester ? `Semester ${entry.semester}` : "-" },
    { label: "Section *", value: entry.classSection ? `Section ${entry.classSection}` : "-" },
  ];

  const studentRowY = y;
  let maxStudentH = 0;
  studentFields.forEach((field, i) => {
    const x = margin + i * (studentW + 3);
    const nextY = drawField(x, studentRowY, studentW, field.label, field.value, 8);
    maxStudentH = Math.max(maxStudentH, nextY - studentRowY);
  });
  y = studentRowY + maxStudentH;

  if (entry.remark) {
    y = ensureSpaceAt(y + 4, 25);
    y = drawField(margin, y, pageW - margin * 2, "Admin Remark", entry.remark, 14);
  }

  doc.save(`Journal_${entry.usn || "entry"}_Week${entry.week || "X"}.pdf`);
}
