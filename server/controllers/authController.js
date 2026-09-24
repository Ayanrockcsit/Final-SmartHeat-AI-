import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "smartheat_jwt_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function normalizePhone(phone) {
  if (!phone) return "";
  return phone.toString().replace(/[\s\-\(\)]/g, "");
}

function buildPhoneQuery(phone) {
  const clean = normalizePhone(phone);
  if (!clean) return [];
  const withoutCountry = clean.replace(/^(\+91|91)/, "");
  const withCountry = `+91${withoutCountry}`;
  const with91 = `91${withoutCountry}`;
  return Array.from(new Set([phone, clean, withoutCountry, withCountry, with91].filter(Boolean)));
}

function sanitize(user) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone || "",
    email: user.email || "",
    role: user.role || "user",
    location: user.location || "Lucknow",
    occupation: user.occupation || "General Public",
    vulnerabilityCategory: user.vulnerabilityCategory || "General Public",
    alertThreshold: user.alertThreshold || "HIGH",
    alertChannels: user.alertChannels || { sms: true, whatsapp: false },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(req, res, next) {
  try {
    const { name, phone, email, password, location, occupation, vulnerabilityCategory } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: "Name, phone number and password are required" });
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.replace(/^\+91/, "").length < 10) {
      return res.status(400).json({ success: false, message: "Please provide a valid 10-digit phone number" });
    }

    const phoneVariants = buildPhoneQuery(phone);
    const existing = await User.findOne({
      $or: [
        { phone: { $in: phoneVariants } },
        ...(email ? [{ email: email.toLowerCase().trim() }] : [])
      ]
    });

    if (existing) {
      const isPhoneMatch = phoneVariants.includes(existing.phone) || phoneVariants.includes(normalizePhone(existing.phone));
      return res.status(409).json({
        success: false,
        message: isPhoneMatch ? "Phone number already registered. Please sign in." : "Email already registered.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.toLowerCase().trim() : "",
      password,
      location: location?.trim() || "Lucknow",
      occupation: occupation || "General Public",
      vulnerabilityCategory: vulnerabilityCategory || "General Public",
      alertChannels: { sms: true, whatsapp: false },
    });

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { phone, identifier, email, password } = req.body;
    const input = (phone || identifier || email || "").toString().trim();
    if (!input || !password) {
      return res.status(400).json({ success: false, message: "Phone number and password are required" });
    }

    const phoneVariants = buildPhoneQuery(input);
    const user = await User.findOne({
      $or: [
        { phone: { $in: phoneVariants } },
        { email: input.toLowerCase() }
      ]
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid phone number or password" });
    }

    const token = signToken(user);
    res.json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ success: true, user: sanitize(req.user) });
}

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, phone, email, location, occupation, vulnerabilityCategory, alertChannels, alertThreshold } = req.body;

    if (name && name.trim()) user.name = name.trim();
    if (location && location.trim()) user.location = location.trim();
    if (occupation !== undefined) user.occupation = occupation;
    if (vulnerabilityCategory !== undefined) user.vulnerabilityCategory = vulnerabilityCategory;
    if (alertThreshold) user.alertThreshold = alertThreshold;

    if (alertChannels) {
      user.alertChannels = {
        sms: alertChannels.sms !== undefined ? Boolean(alertChannels.sms) : (user.alertChannels?.sms ?? true),
        whatsapp: alertChannels.whatsapp !== undefined ? Boolean(alertChannels.whatsapp) : (user.alertChannels?.whatsapp ?? false),
      };
    }

    if (phone && normalizePhone(phone) !== normalizePhone(user.phone)) {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone.replace(/^\+91/, "").length < 10) {
        return res.status(400).json({ success: false, message: "Please provide a valid 10-digit phone number" });
      }
      const existingPhone = await User.findOne({
        _id: { $ne: user._id },
        phone: { $in: buildPhoneQuery(cleanPhone) },
      });
      if (existingPhone) {
        return res.status(409).json({ success: false, message: "This phone number is already registered to another account" });
      }
      user.phone = cleanPhone;
    }

    if (email !== undefined && email.trim() !== (user.email || "")) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail) {
        const existingEmail = await User.findOne({
          _id: { $ne: user._id },
          email: cleanEmail,
        });
        if (existingEmail) {
          return res.status(409).json({ success: false, message: "This email address is already in use" });
        }
        user.email = cleanEmail;
      } else {
        user.email = "";
      }
    }

    await user.save();
    res.json({ success: true, message: "Profile updated successfully", user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}
