import * as yup from "yup";

// Reusable validation messages
export const MSG = {
  required: (field: string) => `${field} is required`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid 10-digit phone number",
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
  match: "Your passwords do not match",
  number: (field: string) => `${field} must be a number`,
  minNumber: (field: string, min: number) => `${field} must be at least ${min}`,
};

// Reusable fields
const emailField = yup.string().email(MSG.email);
const phoneField = yup.string().matches(/^[0-9]{10}$/, MSG.phone);
const passwordField = yup.string().min(6, MSG.minLength("Password", 6));

export const loginSchema = yup.object().shape({
  email: yup.string().when("$activeTab", {
    is: "user",
    then: (schema) => schema.required(MSG.required("Email")).email(MSG.email),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone: yup.string().when("$activeTab", {
    is: "worker",
    then: (schema) => schema.required(MSG.required("Phone number")).matches(/^[0-9]{10}$/, MSG.phone),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: passwordField.required(MSG.required("Password")),
});

export const registerSchema = yup.object().shape({
  name: yup.string().required(MSG.required("Full Name")),
  email: emailField.required(MSG.required("Email")),
  phone: phoneField.required(MSG.required("Phone number")),
  password: passwordField.required(MSG.required("Password")),
  confirmPassword: yup
    .string()
    .required(MSG.required("Confirm Password"))
    .oneOf([yup.ref("password")], MSG.match),
  securityQuestion: yup.string().required(MSG.required("Security Question")),
  securityAnswer: yup.string().required(MSG.required("Security Answer")),
});

export const workerSchema = yup.object().shape({
  name: yup.string().required(MSG.required("Full Name")),
  phone: phoneField.required(MSG.required("Phone number")),
  category: yup.string().required(MSG.required("Primary Category")),
  subcategory: yup.string().required(MSG.required("Specialization")),
  experience: yup
    .number()
    .typeError(MSG.number("Experience"))
    .min(0, MSG.minNumber("Experience", 0))
    .required(MSG.required("Experience")),
  aadhaarNumber: yup
    .string()
    .required(MSG.required("Aadhaar Number"))
    .matches(/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"),
  password: passwordField.required(MSG.required("Password")),
  securityQuestion: yup.string().required(MSG.required("Security Question")),
  securityAnswer: yup.string().required(MSG.required("Security Answer")),
});

export const bookingSchema = yup.object().shape({
  address: yup.string().required(MSG.required("Service Address")),
  phone: phoneField.required(MSG.required("Contact Number")),
  bookingDate: yup.string().required(MSG.required("Preferred Date")),
  paymentMethod: yup.string().required(MSG.required("Payment Method")),
  subcategory: yup.string().required(MSG.required("Specific Task")),
  totalAmount: yup.number().typeError(MSG.number("Total Amount")).optional(),
});

export const reviewSchema = yup.object().shape({
  rating: yup
    .number()
    .typeError(MSG.number("Rating"))
    .min(1)
    .max(5)
    .required(MSG.required("Rating")),
  comment: yup.string().required(MSG.required("Feedback comment")),
});

export const profileSchema = yup.object().shape({
  name: yup.string().required(MSG.required("Full Name")),
  phone: phoneField.required(MSG.required("Phone number")),
  category: yup.string().when("$role", {
    is: "worker",
    then: (schema) => schema.required(MSG.required("Primary Category")),
    otherwise: (schema) => schema.notRequired(),
  }),
  subcategory: yup.string().when("$role", {
    is: "worker",
    then: (schema) => schema.required(MSG.required("Specialization")),
    otherwise: (schema) => schema.notRequired(),
  }),
  experience: yup.number().when("$role", {
    is: "worker",
    then: (schema) => schema.typeError(MSG.number("Experience")).min(0).required(MSG.required("Experience")),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const categorySchema = yup.object().shape({
  name: yup.string().required(MSG.required("Category Name")),
  subcategories: yup.string().required(MSG.required("Subcategories")),
});
