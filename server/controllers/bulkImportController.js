const XLSX = require("xlsx");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Class = require("../models/Class");
const BulkImport = require("../models/BulkImport");

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

const validateHeaders = (data, requiredHeaders) => {
  if (!data || data.length === 0)
    return { valid: false, errors: ["File is empty"] };

  const firstRow = data[0];
  const headers = Object.keys(firstRow).map((h) => h.toLowerCase().trim());
  const missingHeaders = requiredHeaders.filter(
    (h) => !headers.includes(h.toLowerCase()),
  );

  if (missingHeaders.length > 0) {
    return {
      valid: false,
      errors: [`Missing required columns: ${missingHeaders.join(", ")}`],
    };
  }
  return { valid: true, errors: [] };
};

// **IMPROVED EMAIL VALIDATION**
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.toLowerCase());
};

// **IMPROVED PHONE VALIDATION - 10 digit minimum**
const isValidPhone = (phone) => {
  if (!phone) return true;
  const digitsOnly = phone.toString().replace(/\D/g, "");
  return digitsOnly.length >= 10;
};

// **IMPROVED GENDER VALIDATION - ENUM CHECK**
const isValidGender = (gender) => {
  if (!gender) return true;
  const validGenders = ["Male", "Female", "Other", "Prefer not to say"];
  return validGenders.includes(gender.trim());
};

// **IMPROVED DATE VALIDATION - WITH AGE CHECK**
const parseDate = (dateString) => {
  if (!dateString) return null;
  const trimmed = dateString.toString().trim();
  if (!trimmed) return null;

  let date;
  const today = new Date();

  // Handle DD/MM/YYYY format (Indian format - TRY FIRST)
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const ddmmyyyyMatch = trimmed.match(ddmmyyyyRegex);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1]);
    const month = parseInt(ddmmyyyyMatch[2]);
    const year = parseInt(ddmmyyyyMatch[3]);

    // Validate: if day > 12, it must be DD/MM/YYYY format
    // if day <= 12 and month <= 12, try DD/MM first, then MM/DD
    if (day > 12) {
      // Definitely DD/MM/YYYY
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
    } else if (month > 12) {
      // Month is invalid for MM position, must be DD/MM/YYYY
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
    } else {
      // Both could be valid - assume DD/MM/YYYY for Indian format
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }

  // Handle MM/DD/YYYY format (US format)
  const mmddyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const mmddyyyyMatch = trimmed.match(mmddyyyyRegex);
  if (mmddyyyyMatch) {
    const month = parseInt(mmddyyyyMatch[1]);
    const day = parseInt(mmddyyyyMatch[2]);
    const year = parseInt(mmddyyyyMatch[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Handle YYYY-MM-DD format
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = trimmed.match(dateRegex);
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Handle Excel numeric serial dates (Excel date system)
  if (/^\d+$/.test(trimmed)) {
    const serial = parseInt(trimmed);
    // Excel serial number for date
    if (serial > 0 && serial < 60000) {
      // Excel epoch is December 30, 1899
      const excelEpoch = new Date(1899, 11, 30);
      date = new Date(excelEpoch.getTime() + serial * 86400000);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) return date;
    }
  }

  // Fallback: Try standard parsing
  date = new Date(trimmed);
  if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date <= today)
    return date;

  return null;
};

// **NEW: Validate date is not in future and age is between 5-100 years**
const isValidDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return true;

  const date = parseDate(dateOfBirth);
  if (!date) {
    return false;
  }

  const today = new Date();

  // Set time to start of day for both dates to avoid timezone issues
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const normalizedBirth = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  // Check if date is in future
  if (normalizedBirth > normalizedToday) {
    return false;
  }

  // Calculate age in years (using full years)
  let age = normalizedToday.getFullYear() - normalizedBirth.getFullYear();
  const monthDiff = normalizedToday.getMonth() - normalizedBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && normalizedToday.getDate() < normalizedBirth.getDate())
  ) {
    age--;
  }

  // Check if age is between 5 and 100 years
  if (age < 5 || age > 100) {
    return false;
  }

  return true;
};

// ============================================================================
// ID GENERATION
// ============================================================================

const generateStudentIdBatch = async (prefix = "S", count) => {
  const lastStudent = await Student.findOne(
    { studentId: { $regex: `^${prefix}\\d+$` } },
    { studentId: 1 },
  ).sort({ studentId: -1 });

  let nextNumber = 1;
  if (lastStudent && lastStudent.studentId) {
    const match = lastStudent.studentId.match(/\d+$/);
    if (match) nextNumber = parseInt(match[0]) + 1;
  }

  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(`${prefix}${String(nextNumber + i).padStart(4, "0")}`);
  }
  return ids;
};

const generateTeacherIdBatch = async (prefix = "T", count) => {
  const lastTeacher = await Teacher.findOne(
    { teacherId: { $regex: `^${prefix}\\d+$` } },
    { teacherId: 1 },
  ).sort({ teacherId: -1 });

  let nextNumber = 1;
  if (lastTeacher && lastTeacher.teacherId) {
    const match = lastTeacher.teacherId.match(/\d+$/);
    if (match) nextNumber = parseInt(match[0]) + 1;
  }

  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(`${prefix}${String(nextNumber + i).padStart(4, "0")}`);
  }
  return ids;
};

// **NEW: Use phone number as password**
const generateTempPassword = (phoneNumber) => {
  return phoneNumber || "defaultPassword123"; // Use phone as password, or default if no phone
};

// ============================================================================
// BULK IMPORT STUDENTS
// ============================================================================

const bulkImportStudents = async (req, res) => {
  // Note: Using session without transaction for standalone MongoDB compatibility
  const session = await mongoose.startSession();

  let bulkImportRecord = null;

  try {
    if (!req.file) {
      session.endSession();
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel / CSV file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      session.endSession();
      return res.status(400).json({
        message: "File is empty. Please upload a file with student data.",
      });
    }

    // Validate required headers
    const headerValidation = validateHeaders(data, [
      "firstName",
      "lastName",
      "email",
    ]);
    if (!headerValidation.valid) {
      session.endSession();
      return res.status(400).json({
        message: "Invalid file format",
        errors: headerValidation.errors,
      });
    }

    const totalRows = data.length;

    // Create import record FIRST (for progress tracking)
    bulkImportRecord = await BulkImport.create(
      [
        {
          importType: "students",
          fileName: req.file.originalname || "upload.xlsx",
          adminId: req.user?._id,
          totalRows,
          status: "processing",
          progressPercentage: 0,
        },
      ],
      { session },
    );
    const importId = bulkImportRecord[0]._id;

    const results = {
      totalRows,
      successCount: 0,
      failureCount: 0,
      successfulStudents: [], // Store only IDs and emails, NOT passwords
      failedRows: [],
    };

    // Build class map for validation
    const classes = await Class.find();
    const classMap = {};
    classes.forEach((cls) => {
      const normalizedName = cls.className?.toString().trim().toLowerCase();
      classMap[normalizedName] = cls._id;
      classMap[cls._id?.toString()] = cls._id;
    });

    // ── PHASE 1: Pre-validate all rows ──
    const pendingRows = [];
    const emailsInFile = [];

    for (let idx = 0; idx < data.length; idx++) {
      const row = data[idx];
      const rowNumber = idx + 2;
      const errors = [];

      // **IMPROVED VALIDATION**
      const firstName = row.firstName?.toString().trim();
      const lastName = row.lastName?.toString().trim();
      const email = row.email?.toString().toLowerCase().trim();

      if (!firstName) errors.push("firstName is required");
      if (!lastName) errors.push("lastName is required");
      if (!email) errors.push("email is required");
      else if (!isValidEmail(email)) errors.push("Invalid email format");

      const phone = row.phone?.toString().trim() || null;
      const gender = row.gender?.toString().trim() || null;
      const dateOfBirth = row.dateOfBirth?.toString().trim() || null;
      const classInput = row.class?.toString().trim() || null;
      const department = row.department?.toString().trim() || null;
      const address = row.address?.toString().trim() || null;

      const fatherName = row.fatherName?.toString().trim() || null;
      const fatherPhone = row.fatherPhone?.toString().trim() || null;
      const motherName = row.motherName?.toString().trim() || null;
      const motherPhone = row.motherPhone?.toString().trim() || null;

      // Validate phone
      if (phone && !isValidPhone(phone))
        errors.push("Invalid phone number (minimum 10 digits)");
      if (fatherPhone && !isValidPhone(fatherPhone))
        errors.push("Invalid father phone number");
      if (motherPhone && !isValidPhone(motherPhone))
        errors.push("Invalid mother phone number");

      // Validate gender
      if (gender && !isValidGender(gender))
        errors.push(
          "Gender must be: Male, Female, Other, or Prefer not to say",
        );

      // Validate date of birth
      if (dateOfBirth && !isValidDateOfBirth(dateOfBirth))
        errors.push("Date of birth must be valid and age between 5-100 years");

      // Validate class
      let classId = null;
      if (classInput) {
        classId = classMap[classInput.toLowerCase()] || classMap[classInput];
        if (!classId) {
          errors.push(`Class "${classInput}" not found in system`);
        }
      }

      if (errors.length > 0) {
        results.failureCount++;
        results.failedRows.push({ rowNumber, data: row, errors });
        continue;
      }

      emailsInFile.push(email);
      pendingRows.push({
        rowNumber,
        firstName,
        lastName,
        email,
        phone,
        gender,
        dateOfBirth,
        classInput,
        classId,
        department,
        address,
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
      });
    }

    // ── PHASE 2: Batch check for duplicate emails ──
    const existingStudentEmails = new Set(
      (await Student.find({ email: { $in: emailsInFile } }, { email: 1 })).map(
        (s) => s.email,
      ),
    );
    const existingUserEmails = new Set(
      (await User.find({ email: { $in: emailsInFile } }, { email: 1 })).map(
        (u) => u.email,
      ),
    );

    // ── PHASE 3: Filter duplicates and prepare valid rows ──
    const seenInFile = new Set();
    const validRows = [];
    for (const row of pendingRows) {
      if (existingStudentEmails.has(row.email)) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: ["Email already exists as a student in the system"],
        });
      } else if (existingUserEmails.has(row.email)) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: ["Email is already registered as a user"],
        });
      } else if (seenInFile.has(row.email)) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: ["Duplicate email found within the uploaded file"],
        });
      } else {
        seenInFile.add(row.email);
        validRows.push(row);
      }
    }

    // ── PHASE 4: Generate all IDs upfront ──
    const studentIds = await generateStudentIdBatch("S", validRows.length);

    // ── PHASE 5: Process in batches with progress tracking ──
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const studentId = studentIds[i];

      // Use phone number as password
      const tempPassword = generateTempPassword(row.phone);

      try {
        // Create User
        const user = new User({
          name: `${row.firstName} ${row.lastName}`,
          email: row.email,
          password: tempPassword, // pre-save hook will hash it
          role: "student",
        });
        await user.save({ session });

        // Build guardian info only if provided
        const guardianInfo = {
          fatherName: row.fatherName || undefined,
          fatherPhone: row.fatherPhone || undefined,
          motherName: row.motherName || undefined,
          motherPhone: row.motherPhone || undefined,
        };
        const hasGuardianInfo = Object.values(guardianInfo).some(Boolean);

        // Create Student record
        const student = new Student({
          studentId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone || undefined,
          gender: row.gender || undefined,
          dateOfBirth: parseDate(row.dateOfBirth) || undefined,
          class: row.classId || undefined,
          department: row.department || undefined,
          address: row.address || undefined,
          guardianInfo: hasGuardianInfo ? guardianInfo : undefined,
          userId: user._id,
          admissionDate: new Date(),
        });
        await student.save({ session });

        results.successCount++;
        results.successfulStudents.push({
          studentId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          userId: user._id,
          // NOTE: Password is NOT returned here
        });
      } catch (error) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: [`Database error: ${error.message}`],
        });
      }

      // Update progress every 10 rows
      if ((i + 1) % 10 === 0) {
        const progress = Math.floor(((i + 1) / validRows.length) * 100);
        await BulkImport.findByIdAndUpdate(importId, {
          processedRows: i + 1,
          progressPercentage: progress,
        });
      }
    }

    // ── Transaction would be committed here (skipped for standalone MongoDB) ──

    // ── Update final record ──
    await BulkImport.findByIdAndUpdate(importId, {
      successCount: results.successCount,
      failureCount: results.failureCount,
      processedRows: validRows.length,
      progressPercentage: 100,
      status: "completed",
      successfulRecords: results.successfulStudents.map((s) => ({
        id: s.studentId,
        email: s.email,
        name: `${s.firstName} ${s.lastName}`,
        type: "student",
        userId: s.userId,
      })),
      failedRecords: results.failedRows,
      completedAt: new Date(),
    });

    return res.status(200).json({
      message: `Bulk import completed: ${results.successCount} students added, ${results.failureCount} failed.`,
      importId: importId.toString(),
      totalRows: results.totalRows,
      successCount: results.successCount,
      failureCount: results.failureCount,
      failedRows: results.failedRows,
      // NOTE: NOT returning temp passwords here
    });
  } catch (error) {
    console.error("Bulk import error:", error);

    // Mark import as failed if we have a record
    if (bulkImportRecord) {
      await BulkImport.findByIdAndUpdate(bulkImportRecord[0]._id, {
        status: "failed",
        errorLog: error.message,
      });
    }

    res.status(500).json({
      message: "Error processing file",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// ============================================================================
// BULK IMPORT TEACHERS
// ============================================================================

const bulkImportTeachers = async (req, res) => {
  // Note: Using session without transaction for standalone MongoDB compatibility
  const session = await mongoose.startSession();

  let bulkImportRecord = null;

  try {
    if (!req.file) {
      session.endSession();
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel / CSV file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      session.endSession();
      return res.status(400).json({
        message: "File is empty. Please upload a file with teacher data.",
      });
    }

    // Validate required headers
    const headerValidation = validateHeaders(data, [
      "name",
      "email",
      "subject",
    ]);
    if (!headerValidation.valid) {
      session.endSession();
      return res.status(400).json({
        message: "Invalid file format",
        errors: headerValidation.errors,
      });
    }

    const totalRows = data.length;

    // Create import record FIRST
    bulkImportRecord = await BulkImport.create(
      [
        {
          importType: "teachers",
          fileName: req.file.originalname || "upload.xlsx",
          adminId: req.user?._id,
          totalRows,
          status: "processing",
          progressPercentage: 0,
        },
      ],
      { session },
    );
    const importId = bulkImportRecord[0]._id;

    const results = {
      totalRows,
      successCount: 0,
      failureCount: 0,
      successfulTeachers: [],
      failedRows: [],
    };

    // ── PHASE 1: Pre-validate all rows ──
    const pendingRows = [];
    const emailsInFile = [];

    for (let idx = 0; idx < data.length; idx++) {
      const row = data[idx];
      const rowNumber = idx + 2;
      const errors = [];

      const name = row.name?.toString().trim();
      const email = row.email?.toString().toLowerCase().trim();
      const subject = row.subject?.toString().trim();

      if (!name) errors.push("name is required");
      if (!email) errors.push("email is required");
      else if (!isValidEmail(email)) errors.push("Invalid email format");
      if (!subject) errors.push("subject is required");

      const phone = row.phone?.toString().trim() || null;
      const department = row.department?.toString().trim() || null;
      const address = row.address?.toString().trim() || null;

      if (phone && !isValidPhone(phone))
        errors.push("Invalid phone number (minimum 10 digits)");

      if (errors.length > 0) {
        results.failureCount++;
        results.failedRows.push({ rowNumber, data: row, errors });
        continue;
      }

      emailsInFile.push(email);
      pendingRows.push({
        rowNumber,
        name,
        email,
        subject,
        phone,
        department,
        address,
      });
    }

    // ── PHASE 2: Batch check for duplicates ──
    const existingTeacherEmails = new Set(
      (await Teacher.find({ email: { $in: emailsInFile } }, { email: 1 })).map(
        (t) => t.email,
      ),
    );
    const existingUserEmails = new Set(
      (await User.find({ email: { $in: emailsInFile } }, { email: 1 })).map(
        (u) => u.email,
      ),
    );

    // ── PHASE 3: Filter duplicates ──
    const seenInFile = new Set();
    const validRows = [];
    for (const row of pendingRows) {
      if (existingTeacherEmails.has(row.email)) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: ["Email already exists as a teacher in the system"],
        });
      } else if (existingUserEmails.has(row.email)) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: ["Email is already registered as a user"],
        });
      } else if (seenInFile.has(row.email)) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: ["Duplicate email found within the uploaded file"],
        });
      } else {
        seenInFile.add(row.email);
        validRows.push(row);
      }
    }

    // ── PHASE 4: Generate all IDs upfront ──
    const teacherIds = await generateTeacherIdBatch("T", validRows.length);

    // ── PHASE 5: Process rows ──
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const teacherId = teacherIds[i];

      // Use phone number as password
      const tempPassword = generateTempPassword(row.phone);

      try {
        // Create User
        const user = new User({
          name: row.name,
          email: row.email,
          password: tempPassword,
          role: "teacher",
        });
        await user.save({ session });

        // Create Teacher record
        const teacher = new Teacher({
          teacherId,
          name: row.name,
          email: row.email,
          subject: row.subject,
          phone: row.phone || undefined,
          department: row.department || undefined,
          address: row.address || undefined,
          userId: user._id,
          joiningDate: new Date(),
        });
        await teacher.save({ session });

        results.successCount++;
        results.successfulTeachers.push({
          teacherId,
          name: row.name,
          email: row.email,
          subject: row.subject,
          userId: user._id,
        });
      } catch (error) {
        results.failureCount++;
        results.failedRows.push({
          rowNumber: row.rowNumber,
          data: row,
          errors: [`Database error: ${error.message}`],
        });
      }

      // Update progress every 10 rows
      if ((i + 1) % 10 === 0) {
        const progress = Math.floor(((i + 1) / validRows.length) * 100);
        await BulkImport.findByIdAndUpdate(importId, {
          processedRows: i + 1,
          progressPercentage: progress,
        });
      }
    }

    // ── Transaction would be committed here (skipped for standalone MongoDB) ──

    // ── Update final record ──
    await BulkImport.findByIdAndUpdate(importId, {
      successCount: results.successCount,
      failureCount: results.failureCount,
      processedRows: validRows.length,
      progressPercentage: 100,
      status: "completed",
      successfulRecords: results.successfulTeachers.map((t) => ({
        id: t.teacherId,
        email: t.email,
        name: t.name,
        type: "teacher",
        userId: t.userId,
      })),
      failedRecords: results.failedRows,
      completedAt: new Date(),
    });

    return res.status(200).json({
      message: `Bulk import completed: ${results.successCount} teachers added, ${results.failureCount} failed.`,
      importId: importId.toString(),
      totalRows: results.totalRows,
      successCount: results.successCount,
      failureCount: results.failureCount,
      failedRows: results.failedRows,
      // NOTE: NOT returning temp passwords here
    });
  } catch (error) {
    console.error("Bulk import error:", error);

    if (bulkImportRecord) {
      await BulkImport.findByIdAndUpdate(bulkImportRecord[0]._id, {
        status: "failed",
        errorLog: error.message,
      });
    }

    res.status(500).json({
      message: "Error processing file",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// ============================================================================
// PROGRESS TRACKING & STATE
// ============================================================================

const getImportStatus = async (req, res) => {
  try {
    const { importId } = req.params;

    if (!importId || !mongoose.Types.ObjectId.isValid(importId)) {
      return res.status(400).json({ message: "Invalid import ID" });
    }

    const importRecord = await BulkImport.findById(importId).select(
      "status progressPercentage processedRows totalRows successCount failureCount",
    );

    if (!importRecord) {
      return res.status(404).json({ message: "Import not found" });
    }

    res.json({
      importId: importRecord._id,
      status: importRecord.status,
      progressPercentage: importRecord.progressPercentage,
      processedRows: importRecord.processedRows,
      totalRows: importRecord.totalRows,
      successCount: importRecord.successCount,
      failureCount: importRecord.failureCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching import status", error: error.message });
  }
};

// ============================================================================
// ERROR REPORT EXPORT
// ============================================================================

const getErrorReport = async (req, res) => {
  try {
    const { importId } = req.params;

    if (!importId || !mongoose.Types.ObjectId.isValid(importId)) {
      return res.status(400).json({ message: "Invalid import ID" });
    }

    const importRecord = await BulkImport.findById(importId);

    if (!importRecord) {
      return res.status(404).json({ message: "Import not found" });
    }

    if (importRecord.failedRecords.length === 0) {
      return res.status(404).json({ message: "No failed records found" });
    }

    // Build CSV
    const headers = ["Row Number", "Errors", "Email", "Name"];
    const rows = importRecord.failedRecords.map((record) => [
      record.rowNumber,
      record.errors.join("; "),
      record.data?.email || "N/A",
      record.data?.firstName
        ? `${record.data.firstName} ${record.data.lastName || ""}`
        : record.data?.name || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="error_report_${importId}.csv"`,
    );
    res.send(csvContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating error report", error: error.message });
  }
};

// ============================================================================
// CREDENTIALS EXPORT
// ============================================================================

const getCredentialsExport = async (req, res) => {
  try {
    const { importId } = req.params;

    if (!importId || !mongoose.Types.ObjectId.isValid(importId)) {
      return res.status(400).json({ message: "Invalid import ID" });
    }

    const importRecord = await BulkImport.findById(importId);

    if (!importRecord) {
      return res.status(404).json({ message: "Import not found" });
    }

    if (importRecord.successfulRecords.length === 0) {
      return res.status(404).json({ message: "No successful records found" });
    }

    // Build CSV with successful records
    const headers = ["ID", "Name", "Email", "Type", "Status"];
    const rows = importRecord.successfulRecords.map((record) => [
      record.id,
      record.name,
      record.email,
      record.type,
      "Created",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="credentials_${importId}.csv"`,
    );
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      message: "Error generating credentials export",
      error: error.message,
    });
  }
};

module.exports = {
  bulkImportStudents,
  bulkImportTeachers,
  getImportStatus,
  getErrorReport,
  getCredentialsExport,
};
