"use client";

import React, { useState } from "react";
import { Card, CardBody } from "reactstrap";
import { FiUser, FiCopy, FiCheck } from "react-icons/fi";
import Layout from "@/components/Layout";
import { useAuth, AuthProvider } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState<boolean>(false);
  const handleCopyUuid = () => {
    if (user?.users_uuid) {
      navigator.clipboard.writeText(user.users_uuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitial = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <Layout>
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#111827",
            margin: 0,
            letterSpacing: "-0.3px",
          }}
        >
          Dashboard
        </h1>
      </div>

      <Card
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        <CardBody style={{ padding: "24px" }}>
          {/* Header Baris Utama: Avatar + Nama + Email */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingBottom: "20px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {/* Avatar circle: background #eef2ff dengan text warna aksen #4f6ef7 */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#eef2ff",
                color: "#4f6ef7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {user?.users_user_name ? getInitial(user.users_user_name) : <FiUser size={20} />}
            </div>

            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "2px",
                }}
              >
                {user?.users_user_name || "Memuat..."}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                {user?.users_email || "-"}
              </div>
            </div>
          </div>

          {/* Baris Detail Terpisah: Status & UUID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
              paddingTop: "20px",
            }}
          >
            {/* Status Indicator */}
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#6b7280",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                Status Akun
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: "14px", color: "#111827", fontWeight: 500 }}>
                  Aktif
                </span>
              </div>
            </div>

            {/* UUID */}
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#6b7280",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                UUID Pengguna
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <code
                  style={{
                    fontSize: "13px",
                    fontFamily: "monospace",
                    color: "#111827",
                    backgroundColor: "#f9fafb",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {user?.users_uuid || "-"}
                </code>
                {user?.users_uuid && (
                  <button
                    type="button"
                    onClick={handleCopyUuid}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: copied ? "#22c55e" : "#6b7280",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Salin UUID"
                  >
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Layout>
  );
}
