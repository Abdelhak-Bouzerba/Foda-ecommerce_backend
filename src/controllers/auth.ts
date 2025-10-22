import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../utils/joiValidate";
import generateJWT from "../utils/generateJWT";
import userModel from "../models/user";
import { sendEmail } from "../utils/sendEmail";


//register a new user
export const registerUser = async (req: Request, res: Response) => {
  const { email, phoneNumber, password } = req.body;

  //check if all fields are provided
  if (!email || !phoneNumber || !password) {
    res.status(400).json({ message: "all the fields are required" });
    return;
  }

  //validate body
  const { error } = registerSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  //check if user already exsit
  const exsitingUser = await userModel.findOne({ email });
  if (exsitingUser) {
    res.status(400).json({ message: "User already exsit" });
    return;
  }

  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //create username
  let username = email.substring(0, email.indexOf("@"));
  if (username.length > 10) {
    username = username.substring(0, 10);
  }

  //ensure username is unique
  while (await userModel.findOne({ username })) {
    username = username + Date.now().toString().substring(10);
  }

  //create the new user
  const newUser = await userModel.create({
    username,
    email,
    phoneNumber,
    password: hashedPassword,
  });

  //check if user is admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && email === adminEmail) {
    newUser.role = "admin";
  }

  //save new user to database
  await newUser.save();

  //generate JWT token
  const token = generateJWT({ id: newUser._id, username, role: newUser.role });

  //send welcome email to the new user
  const options = {
    to: newUser.email,
    subject: "Welcome to Foda E-commerce Platform",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Welcome to Foda</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px !important; }
      h1 { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fb; font-family:Arial,Helvetica,sans-serif; color:#1f2937;">
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Welcome to Foda — we’re excited to have you on board.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f7fb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px; max-width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(17,24,39,0.08);">
          <tr>
            <td align="left" style="background:linear-gradient(135deg,#0ea5e9,#2563eb); padding:20px 24px;">
              <div style="font-size:18px; font-weight:700; color:#ffffff; letter-spacing:0.3px;">Foda</div>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding:32px;">
              <h1 style="margin:0 0 12px; font-size:24px; line-height:1.25; color:#111827;">Welcome, ${
                newUser.username
              }!</h1>
              <p style="margin:0 0 16px; font-size:14px; line-height:1.7; color:#374151;">
                Thanks for joining Foda, your trusted e‑commerce platform. Your account has been created successfully.
              </p>
              <p style="margin:0 0 24px; font-size:14px; line-height:1.7; color:#374151;">
                Browse curated products, manage your cart, and enjoy a smooth checkout experience.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td>
                    <a href="${
                      process.env.APP_URL || "#"
                    }" style="display:inline-block; background-color:#2563eb; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600; font-size:14px;">
                      Visit Store
                    </a>
                  </td>
                </tr>
              </table>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
              <p style="margin:0; font-size:12px; color:#6b7280;">
                If you did not sign up for this account, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px; background-color:#f9fafb; text-align:center;">
              <p style="margin:0 0 4px; font-size:12px; color:#6b7280;">Foda E‑commerce</p>
              <p style="margin:0; font-size:12px; color:#9ca3af;">© ${new Date().getFullYear()} Foda. All rights reserved.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0; font-size:11px; color:#9ca3af;">
          You received this email because you created an account at Foda.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
  await sendEmail(options);

  //send response
  res.status(201).json({
    message: "registred successfully",
    newUser: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
    },
    token,
  });
};

//login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  //check if all fields are provided
  if (!email || !password) {
    res.status(400).json({ message: "all the fields are required" });
    return;
  }

  //validate body
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  //check if user exsit
  const existingUser = await userModel.findOne({ email });
  if (!existingUser) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  //compare password
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  //generate JWT token
  const token = generateJWT({
    id: existingUser._id,
    username: existingUser.username,
    role: existingUser.role,
  });

  //send response
  res.status(200).json({
    message: "login successful",
    user: {
      id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      role: existingUser.role,
    },
    token,
  });
};