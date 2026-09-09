"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Navbar,
  Container,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "reactstrap";
import {
  FiGrid,
  FiFileText,
  FiLogOut,
  FiChevronDown,
  FiUser,
  FiLayers,
} from "react-icons/fi";
import { AuthProvider, useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const pathname = usePathname();
  const { user: currentUser, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner size="sm" style={{ color: "#4f6ef7" }} />
      </div>
    );
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <FiGrid size={18} />,
    },
    {
      label: "Content Management",
      href: "/content",
      icon: <FiFileText size={18} />,
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Sidebar Kiri (Fixed, 250px, Light Theme #ffffff) */}
      <aside
        style={{
          width: "250px",
          minWidth: "250px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {/* Brand / Logo Header */}
        <div
          style={{
            height: "64px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: "12px",
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
          <span
            style={{
              color: "#111827",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "-0.2px",
            }}
          >
            LMS Admin
          </span>
        </div>

        {/* Sidebar Menu List */}
        <nav style={{ padding: "16px 0", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              padding: "0 20px 8px 20px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#6b7280",
            }}
          >
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#4f6ef7" : "#6b7280",
                  backgroundColor: isActive ? "#eef2ff" : "transparent",
                  borderLeft: isActive ? "3px solid #4f6ef7" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    color: isActive ? "#4f6ef7" : "#6b7280",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Status */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            Sistem Terhubung
          </span>
        </div>
      </aside>

      {/* Main Content Area (offset by 250px sidebar) */}
      <div
        style={{
          marginLeft: "250px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Topbar Navbar */}
        <Navbar
          style={{
            height: "64px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 900,
          }}
        >
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            {pathname === "/dashboard"
              ? "Halaman Utama"
              : pathname === "/content"
              ? "Modul Konten"
              : "Admin Portal"}
          </div>

          {/* User Dropdown */}
          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
            <DropdownToggle
              tag="button"
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "6px",
                color: "#111827",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#eef2ff",
                  color: "#4f6ef7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {currentUser?.users_user_name
                  ? currentUser.users_user_name.charAt(0).toUpperCase()
                  : <FiUser size={14} />}
              </div>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                {currentUser?.users_user_name || "Pengguna"}
              </span>
              <FiChevronDown size={14} style={{ color: "#6b7280" }} />
            </DropdownToggle>

            <DropdownMenu
              end
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                marginTop: "8px",
                padding: "8px 0",
                minWidth: "180px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                style={{
                  padding: "8px 16px",
                  borderBottom: "1px solid #e5e7eb",
                  marginBottom: "4px",
                }}
              >
                <div style={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>
                  {currentUser?.users_user_name || "User"}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", wordBreak: "break-all" }}>
                  {currentUser?.users_email || "-"}
                </div>
              </div>
              <DropdownItem
                onClick={logout}
                style={{
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  padding: "8px 16px",
                }}
              >
                <FiLogOut size={14} />
                <span>Keluar</span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Navbar>

        {/* Content Wrapper */}
        <main style={{ flex: 1, padding: "32px", backgroundColor: "#ffffff" }}>
          <Container fluid style={{ padding: 0, maxWidth: "1200px" }}>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
