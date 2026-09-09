"use client";

import React, { useState, useEffect, Suspense, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { setToken, setUser } from "@/lib/auth";

interface FormErrors {
  email?: string;
  password?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setSuccessMessage("Registrasi berhasil! Silakan masuk dengan akun Anda.");
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Format email tidak valid";
      }
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
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
      const response = await api.post("/api/auth/login", {
        users_email: email,
        users_password: password,
      });

      const { data } = response;

      if (data && data.success) {
        const accessToken = data.data?.access_token;
        const userObj = data.data?.user;

        if (accessToken) {
          setToken(accessToken);
        }
        if (userObj) {
          setUser(userObj);
        }

        router.push("/dashboard");
      } else {
        setServerError(data.message || "Email atau password tidak sesuai.");
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        const errorMsg =
          axiosErr.response?.data?.message || "Email atau password salah.";
        setServerError(errorMsg);
      } else {
        setServerError("Tidak dapat terhubung ke server backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
            Masuk
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            Masukkan kredensial Anda untuk melanjutkan
          </div>
        </div>

        {successMessage && (
          <Alert
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
              fontSize: "13px",
              padding: "10px 14px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {successMessage}
          </Alert>
        )}

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

          <FormGroup style={{ marginBottom: "24px" }}>
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
                placeholder="••••••••"
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
                <span>Memproses...</span>
              </span>
            ) : (
              "Masuk"
            )}
          </Button>

          <div style={{ textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
            Belum punya akun?{" "}
            <Link
              href="/register"
              style={{
                color: "#4f6ef7",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Register
            </Link>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={4}>
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

            <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}><Spinner size="sm" /></div>}>
              <LoginForm />
            </Suspense>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
