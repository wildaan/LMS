"use client";

import React, { useState, useEffect, useCallback, useMemo, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  FormFeedback,
  Alert,
  Spinner,
} from "reactstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiX,
  FiCheck,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import {
  contentService,
  ContentItem,
  ContentPayload,
} from "@/services/content";

interface FormErrors {
  content_title?: string;
}

export default function ContentPage() {
  const [data, setData] = useState<ContentItem[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);

  // Search state with debounce
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  // Modal Form (Create / Edit) state
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal Delete Confirm state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Auto-dismiss notification
  const showNotification = (message: string, type: "success" | "danger" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Search debounce 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch list of content from backend
  const fetchContents = useCallback(
    async (page: number, currentPerPage: number, search: string) => {
      setLoading(true);
      try {
        const response = await contentService.getContents({
          page,
          per_page: currentPerPage,
          search: search || undefined,
        });

        if (response.success && response.data) {
          setData(response.data.items || []);
          setTotalRows(response.data.total || 0);
        }
      } catch (err: unknown) {
        console.error("Gagal mengambil data konten:", err);
        showNotification("Gagal memuat data konten dari server.", "danger");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchContents(currentPage, perPage, debouncedSearch);
  }, [fetchContents, currentPage, perPage, debouncedSearch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedContentId(null);
    setTitle("");
    setCategory("");
    setDescription("");
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: ContentItem) => {
    setIsEditMode(true);
    setSelectedContentId(item.content_id);
    setTitle(item.content_title || "");
    setCategory(item.content_category || "");
    setDescription(item.content_description || "");
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (item: ContentItem) => {
    setContentToDelete(item);
    setDeleteModalOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!title.trim()) {
      errors.content_title = "Judul konten wajib diisi.";
    } else if (title.trim().length > 255) {
      errors.content_title = "Judul konten maksimal 255 karakter.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload: ContentPayload = {
      content_title: title.trim(),
      content_category: category.trim() || undefined,
      content_description: description.trim() || undefined,
    };

    try {
      if (isEditMode && selectedContentId !== null) {
        const res = await contentService.updateContent(selectedContentId, payload);
        if (res.success) {
          setFormModalOpen(false);
          showNotification("Konten berhasil diperbarui.", "success");
          fetchContents(currentPage, perPage, debouncedSearch);
        }
      } else {
        const res = await contentService.createContent(payload);
        if (res.success) {
          setFormModalOpen(false);
          showNotification("Konten baru berhasil ditambahkan.", "success");
          fetchContents(1, perPage, debouncedSearch);
          if (currentPage !== 1) setCurrentPage(1);
        }
      }
    } catch (err: unknown) {
      console.error("Gagal menyimpan data:", err);
      showNotification("Terjadi kesalahan saat menyimpan data.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!contentToDelete) return;

    setDeleting(true);
    try {
      const res = await contentService.deleteContent(contentToDelete.content_id);
      if (res.success) {
        setDeleteModalOpen(false);
        setContentToDelete(null);
        showNotification("Konten berhasil dihapus.", "success");
        fetchContents(currentPage, perPage, debouncedSearch);
      }
    } catch (err: unknown) {
      console.error("Gagal menghapus data:", err);
      showNotification("Terjadi kesalahan saat menghapus data.", "danger");
    } finally {
      setDeleting(false);
    }
  };

  // Format readable date
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Columns definition for react-data-table-component
  const columns: TableColumn<ContentItem>[] = useMemo(
    () => [
      {
        name: "Judul",
        grow: 3,
        selector: (row) => row.content_title,
        cell: (row) => (
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                fontWeight: 600,
                color: "#111827",
                fontSize: "14px",
                lineHeight: "1.4",
              }}
            >
              {row.content_title}
            </div>
            {row.content_description && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "2px",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.content_description}
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Kategori",
        grow: 1.5,
        selector: (row) => row.content_category || "-",
        cell: (row) =>
          row.content_category ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.2px",
              }}
            >
              {row.content_category}
            </span>
          ) : (
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>-</span>
          ),
      },
      {
        name: "Tanggal Dibuat",
        grow: 1.5,
        selector: (row) => row.content_create_date || "",
        cell: (row) => (
          <span style={{ color: "#4b5563", fontSize: "13px" }}>
            {formatDate(row.content_create_date)}
          </span>
        ),
      },
      {
        name: "Aksi",
        grow: 1.2,
        cell: (row) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleOpenEditModal(row)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "transparent",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "5px 10px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#4f6ef7",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Edit Konten"
            >
              <FiEdit2 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenDeleteModal(row)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "transparent",
                border: "1px solid #fee2e2",
                borderRadius: "6px",
                padding: "5px 10px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#ef4444",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Hapus Konten"
            >
              <FiTrash2 size={13} />
              <span>Hapus</span>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // DataTable custom styling
  const customStyles = useMemo(
    () => ({
      table: {
        style: {
          backgroundColor: "#ffffff",
        },
      },
      headRow: {
        style: {
          backgroundColor: "#f9fafb",
          borderBottomColor: "#e5e7eb",
          borderBottomWidth: "1px",
          minHeight: "44px",
        },
      },
      headCells: {
        style: {
          color: "#4b5563",
          fontSize: "12px",
          fontWeight: "600",
          textTransform: "uppercase" as const,
          letterSpacing: "0.5px",
          paddingLeft: "16px",
          paddingRight: "16px",
        },
      },
      rows: {
        style: {
          fontSize: "14px",
          color: "#111827",
          minHeight: "56px",
          borderBottomColor: "#f3f4f6",
          borderBottomWidth: "1px",
        },
      },
      cells: {
        style: {
          paddingLeft: "16px",
          paddingRight: "16px",
        },
      },
      pagination: {
        style: {
          borderTopColor: "#e5e7eb",
          borderTopWidth: "1px",
          color: "#6b7280",
          fontSize: "13px",
        },
      },
    }),
    []
  );

  return (
    <Layout>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
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
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: "4px 0 0 0",
            }}
          >
            Kelola data konten pembelajaran, modul, dan materi
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          style={{
            backgroundColor: "#4f6ef7",
            borderColor: "#4f6ef7",
            color: "#ffffff",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiPlus size={16} />
          <span>Tambah Content</span>
        </Button>
      </div>

      {/* Auto-Dismiss Notification Toast */}
      {notification && (
        <Alert
          style={{
            backgroundColor: notification.type === "success" ? "#f0fdf4" : "#fef2f2",
            borderColor: notification.type === "success" ? "#bbf7d0" : "#fecaca",
            color: notification.type === "success" ? "#16a34a" : "#dc2626",
            fontSize: "13px",
            padding: "10px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {notification.type === "success" ? (
              <FiCheck size={16} />
            ) : (
              <FiAlertTriangle size={16} />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <FiX size={16} />
          </button>
        </Alert>
      )}

      {/* Table Card Container */}
      <Card
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        <CardBody style={{ padding: 0 }}>
          {/* Search Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
              <FiSearch
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <Input
                type="text"
                placeholder="Cari judul atau deskripsi..."
                value={searchInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(e.target.value)
                }
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "8px 12px 8px 36px",
                  fontSize: "13px",
                  color: "#111827",
                  width: "100%",
                }}
              />
            </div>

            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              Total Konten:{" "}
              <strong style={{ color: "#111827", fontWeight: 600 }}>{totalRows}</strong>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={data}
            progressPending={loading}
            progressComponent={
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <Spinner size="sm" style={{ color: "#4f6ef7" }} />
                <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
                  Memuat data konten...
                </div>
              </div>
            }
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            paginationDefaultPage={currentPage}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            customStyles={customStyles}
            noDataComponent={
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                  Belum ada data konten
                </div>
                <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
                  {debouncedSearch
                    ? `Tidak ada hasil untuk pencarian "${debouncedSearch}"`
                    : 'Klik tombol "Tambah Content" untuk membuat konten baru'}
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      {/* Modal Form: Tambah / Edit Content */}
      <Modal
        isOpen={formModalOpen}
        toggle={() => !submitting && setFormModalOpen(!formModalOpen)}
        centered
        backdrop="static"
      >
        <ModalHeader
          toggle={() => !submitting && setFormModalOpen(false)}
          style={{
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 20px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {isEditMode ? "Edit Konten" : "Tambah Konten Baru"}
        </ModalHeader>
        <Form onSubmit={handleFormSubmit} noValidate>
          <ModalBody style={{ padding: "20px" }}>
            {/* Title Field */}
            <FormGroup style={{ marginBottom: "16px" }}>
              <Label
                for="content_title"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#4b5563",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Judul Konten <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Input
                type="text"
                id="content_title"
                placeholder="Masukkan judul konten"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setTitle(e.target.value);
                  if (formErrors.content_title) {
                    setFormErrors((prev) => ({ ...prev, content_title: undefined }));
                  }
                }}
                invalid={!!formErrors.content_title}
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: formErrors.content_title ? "#ef4444" : "#e5e7eb",
                  color: "#111827",
                  borderRadius: "6px",
                  padding: "9px 12px",
                  fontSize: "14px",
                }}
              />
              {formErrors.content_title && (
                <FormFeedback style={{ fontSize: "12px", color: "#ef4444" }}>
                  {formErrors.content_title}
                </FormFeedback>
              )}
            </FormGroup>

            {/* Category Field */}
            <FormGroup style={{ marginBottom: "16px" }}>
              <Label
                for="content_category"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#4b5563",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Kategori
              </Label>
              <Input
                type="text"
                id="content_category"
                placeholder="Contoh: Pemrograman, Manajemen, Desain"
                value={category}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCategory(e.target.value)
                }
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  color: "#111827",
                  borderRadius: "6px",
                  padding: "9px 12px",
                  fontSize: "14px",
                }}
              />
            </FormGroup>

            {/* Description Field */}
            <FormGroup style={{ marginBottom: "8px" }}>
              <Label
                for="content_description"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#4b5563",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Deskripsi
              </Label>
              <Input
                type="textarea"
                rows={4}
                id="content_description"
                placeholder="Tuliskan deskripsi konten..."
                value={description}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDescription(e.target.value)
                }
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  color: "#111827",
                  borderRadius: "6px",
                  padding: "9px 12px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: "12px 20px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <Button
              type="button"
              disabled={submitting}
              onClick={() => setFormModalOpen(false)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #e5e7eb",
                color: "#6b7280",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: "#4f6ef7",
                borderColor: "#4f6ef7",
                color: "#ffffff",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {submitting ? (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Spinner size="sm" />
                  <span>Menyimpan...</span>
                </span>
              ) : isEditMode ? (
                "Perbarui Konten"
              ) : (
                "Simpan Konten"
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Modal Confirm: Hapus Content */}
      <Modal
        isOpen={deleteModalOpen}
        toggle={() => !deleting && setDeleteModalOpen(!deleteModalOpen)}
        centered
        backdrop="static"
      >
        <ModalHeader
          toggle={() => !deleting && setDeleteModalOpen(false)}
          style={{
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 20px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Konfirmasi Hapus Konten
        </ModalHeader>
        <ModalBody style={{ padding: "24px 20px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                minWidth: "40px",
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "4px",
                }}
              >
                Hapus konten ini?
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                Apakah Anda yakin ingin menghapus konten{" "}
                <strong style={{ color: "#111827" }}>
                  &ldquo;{contentToDelete?.content_title}&rdquo;
                </strong>
                ? Konten ini akan dinonaktifkan dari sistem.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <Button
            type="button"
            disabled={deleting}
            onClick={() => setDeleteModalOpen(false)}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #e5e7eb",
              color: "#6b7280",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={deleting}
            onClick={handleConfirmDelete}
            style={{
              backgroundColor: "#ef4444",
              borderColor: "#ef4444",
              color: "#ffffff",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {deleting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Spinner size="sm" />
                <span>Menghapus...</span>
              </span>
            ) : (
              "Hapus Sekarang"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
