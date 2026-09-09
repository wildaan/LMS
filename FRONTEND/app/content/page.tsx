"use client";

import React from "react";
import { Card, CardBody } from "reactstrap";
import Layout from "@/components/Layout";

export default function ContentPage() {
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
          Content Management
        </h1>
      </div>

      <Card
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "none",
        }}
      >
        <CardBody style={{ padding: "24px" }}>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            Content Management — CRUD akan diimplementasikan di sini
          </p>
        </CardBody>
      </Card>
    </Layout>
  );
}
