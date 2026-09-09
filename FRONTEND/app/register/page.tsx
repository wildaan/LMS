"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
  FormFeedback,
} from "reactstrap";
import { FiLayers, FiEye, FiEyeOff } from "react-icons/fi";
import api from "@/lib/api";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!userName.trim()) {
      newErrors.username = "Username wajib diisi.";
    }

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Format email tidak valid.";
      }
    }

    if (!password) {
      newErrors.password = "Password wajib diisi.";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
    }

    if (!passwordConfirmation) {
      newErrors.passwordConfirmation = "Konfirmasi password wajib diisi.";
    } else if (passwordConfirmation !== password) {
      newErrors.passwordConfirmation = "Konfirmasi password tidak cocok.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        users_user_name: userName.trim(),
        users_email: email.trim(),
        users_password: password,
        users_password_confirmation: passwordConfirmation,
      });

      if (response.data && response.data.success) {
        router.push("/login?registered=1");
      } else {
        setServerError(response.data.message || "Registrasi gagal, silakan coba lagi.");
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              data?: Record<string, string[]>;
            };
          };
        };

        const fieldErrors = axiosErr.response?.data?.data;
        if (fieldErrors && typeof fieldErrors === "object") {
          const mappedErrors: FormErrors = {};
          if (fieldErrors.users_user_name) mappedErrors.username = fieldErrors.users_user_name[0];
          if (fieldErrors.users_email) mappedErrors.email = fieldErrors.users_email[0];
          if (fieldErrors.users_password) mappedErrors.password = fieldErrors.users_password[0];
          if (fieldErrors.users_password_confirmation) {
            mappedErrors.passwordConfirmation = fieldErrors.users_password_confirmation[0];
          }
          setErrors(mappedErrors);
        }

        const msg = axiosErr.response?.data?.message || "Terjadi kesalahan saat registrasi.";
        setServerError(msg);
      } else {
        setServerError("Tidak dapat terhubung ke server backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5} xl={4}>
            {/* Header Brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  backgroundColor: "#eef2ff",
                  color: "#4f6ef7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiLayers size={18} />
              </div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                  letterSpacing: "-0.2px",
                }}
              >
                LMS Application
              </h1>
            </div>

            {/* Register Card */}
            <Card
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <CardBody style={{ padding: "24px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    Daftar Akun Baru
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>
                    Lengkapi formulir di bawah untuk membuat akun baru
                  </div>
                </div>

                {serverError && (
                  <Alert
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      fontSize: "13px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      marginBottom: "16px",
                    }}
                  >
                    {serverError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                  {/* Username Field */}
                  <FormGroup style={{ marginBottom: "16px" }}>
                    <Label
                      for="users_user_name"
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6b7280",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Nama Lengkap / Username
                    </Label>
                    <Input
                      type="text"
                      id="users_user_name"
                      name="users_user_name"
                      placeholder="Masukkan nama lengkap"
                      value={userName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setUserName(e.target.value);
                        if (errors.username) {
                          setErrors((prev) => ({ ...prev, username: undefined }));
                        }
                      }}
                      invalid={!!errors.username}
                      style={{
                        backgroundColor: "#ffffff",
                        borderColor: errors.username ? "#ef4444" : "#e5e7eb",
                        color: "#111827",
                        borderRadius: "6px",
                        padding: "10px 12px",
                        fontSize: "14px",
                      }}
                    />
                    {errors.username && (
                      <FormFeedback style={{ fontSize: "12px", color: "#ef4444" }}>
                        {errors.username}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* Email Field */}
                  <FormGroup style={{ marginBottom: "16px" }}>
                    <Label
                      for="users_email"
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6b7280",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Email
                    </Label>
                    <Input
                      type="email"
                      id="users_email"
                      name="users_email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors((prev) => ({ ...prev, email: undefined }));
                        }
                      }}
                      invalid={!!errors.email}
                      style={{
                        backgroundColor: "#ffffff",
                        borderColor: errors.email ? "#ef4444" : "#e5e7eb",
                        color: "#111827",
                        borderRadius: "6px",
                        padding: "10px 12px",
                        fontSize: "14px",
                      }}
                    />
                    {errors.email && (
                      <FormFeedback style={{ fontSize: "12px", color: "#ef4444" }}>
                        {errors.email}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* Password Field */}
                  <FormGroup style={{ marginBottom: "16px" }}>
                    <Label
                      for="users_password"
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6b7280",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Password
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="users_password"
                        name="users_password"
                        placeholder="Minimal 8 karakter"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors((prev) => ({ ...prev, password: undefined }));
                          }
                        }}
                        invalid={!!errors.password}
                        style={{
                          backgroundColor: "#ffffff",
                          borderColor: errors.password ? "#ef4444" : "#e5e7eb",
                          color: "#111827",
                          borderRadius: "6px",
                          padding: "10px 40px 10px 12px",
                          fontSize: "14px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          color: "#6b7280",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                        title={showPassword ? "Sembunyikan password" : "Lihat password"}
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <FormFeedback style={{ fontSize: "12px", color: "#ef4444" }}>
                        {errors.password}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* Confirm Password Field */}
                  <FormGroup style={{ marginBottom: "24px" }}>
                    <Label
                      for="users_password_confirmation"
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6b7280",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Konfirmasi Password
                    </Label>
                    <div style={{ position: "relative" }}>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        id="users_password_confirmation"
                        name="users_password_confirmation"
                        placeholder="Ulangi password"
                        value={passwordConfirmation}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setPasswordConfirmation(e.target.value);
                          if (errors.passwordConfirmation) {
                            setErrors((prev) => ({ ...prev, passwordConfirmation: undefined }));
                          }
                        }}
                        invalid={!!errors.passwordConfirmation}
                        style={{
                          backgroundColor: "#ffffff",
                          borderColor: errors.passwordConfirmation ? "#ef4444" : "#e5e7eb",
                          color: "#111827",
                          borderRadius: "6px",
                          padding: "10px 40px 10px 12px",
                          fontSize: "14px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          color: "#6b7280",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                        title={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {errors.passwordConfirmation && (
                      <FormFeedback style={{ fontSize: "12px", color: "#ef4444" }}>
                        {errors.passwordConfirmation}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  <Button
                    block
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: "#4f6ef7",
                      borderColor: "#4f6ef7",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      marginBottom: "16px",
                    }}
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Spinner size="sm" />
                        <span>Mendaftar...</span>
                      </span>
                    ) : (
                      "Daftar Sekarang"
                    )}
                  </Button>

                  <div style={{ textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
                    Sudah punya akun?{" "}
                    <Link
                      href="/login"
                      style={{
                        color: "#4f6ef7",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Login
                    </Link>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
