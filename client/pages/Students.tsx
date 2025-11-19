import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/Select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/organisms/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/organisms/DropdownMenu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/organisms/Pagination';
import {
  Upload,
  Download,
  UserPlus,
  FileSpreadsheet,
  FileText,
  Users,
  Search,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  TrendingUp,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Student, upsertStudent } from '@/lib/storage';
import { apiClient } from '@/lib/api/core/client';
import { STUDENT_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { ApiResponse } from '@/lib/types/api-types';

import { useStudents } from '@/hooks/queries/students.query-hooks';
import { useStudentStats } from '@/hooks/utils/student-stats.utils';
import { useStudentFilters } from '@/hooks/state/student-filters.state';
import { usePagination } from '@/hooks/utils/pagination.utils';
import { exportToCSV, exportToPDF, exportToExcel } from '@/lib/utils/exporters/student-export';

import { StatsCards } from '@/components/features/students/StatsCards';
import { AdvancedFilters } from '@/components/features/students/AdvancedFilters';
import { BulkActions } from '@/components/features/students/BulkActions';
import { EnhancedStudentTable, type SortColumn, type SortDirection } from '@/components/features/students/EnhancedStudentTable';
import { TableControls, type ColumnVisibility } from '@/components/features/students/TableControls';
import { StudentDrawer } from '@/components/features/students/StudentDrawer';
import { StudentCard } from '@/components/features/students/StudentCard';
import { EmptyState } from '@/components/features/students/EmptyState';
import { TableSkeleton } from '@/components/features/students/TableSkeleton';
import { parseImportedRows, mergeStudents, sortStudents } from '@/lib/utils/student-helpers';

export default function Students() {
  const { students, isLoading, invalidate } = useStudents();
  const [isMobileView, setIsMobileView] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [confirmationName, setConfirmationName] = useState('');

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [sortColumn, setSortColumn] = useState<SortColumn | null>('class');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    fullName: true,
    class: true,
    gender: true,
    risk: true,
    actions: true,
  });

  const stats = useStudentStats(students);
  const filters = useStudentFilters(students);

  const sortedStudents = sortStudents(
    filters.filteredStudents,
    sortColumn,
    sortDirection
  );

  const pagination = usePagination(sortedStudents, 25);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Student>({
    defaultValues: {
      id: '',
      name: '',
      surname: '',
      class: '9/A',
      gender: 'K',
      risk: 'Düşük',
      enrollmentDate: new Date().toISOString(),
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onCreate = async (data: Student) => {
    const id = (data.id || '').trim();
    if (!id) {
      toast.error('Öğrenci numarası zorunludur.');
      return;
    }
    if (!/^\d+$/.test(id)) {
      toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
      return;
    }
    if (students.some((s) => s.id === id)) {
      toast.error('Bu öğrenci numarası zaten kayıtlı.');
      return;
    }

    const newStudent = { ...data, id, enrollmentDate: new Date().toISOString() };

    try {
      await upsertStudent(newStudent);
      invalidate();
      reset();
      setOpen(false);
      toast.success('Öğrenci başarıyla eklendi.');
    } catch (error) {
      toast.error('Öğrenci kaydedilemedi. Lütfen tekrar deneyin.');
      console.error('Failed to save student:', error);
    }
  };

  const onEditClick = (student: Student) => {
    setStudentToEdit(student);
    setValue('id', student.id);
    setValue('name', student.name);
    setValue('surname', student.surname);
    setValue('class', student.class);
    setValue('gender', student.gender);
    setValue('risk', student.risk || 'Düşük');
    setEditOpen(true);
  };

  const onUpdate = async (data: Student) => {
    if (!studentToEdit) return;

    const id = (data.id || '').trim();
    if (!id) {
      toast.error('Öğrenci numarası zorunludur.');
      return;
    }
    if (!/^\d+$/.test(id)) {
      toast.error('Öğrenci numarası sadece rakamlardan oluşmalıdır.');
      return;
    }
    if (id !== studentToEdit.id && students.some((s) => s.id === id)) {
      toast.error('Bu öğrenci numarası zaten kayıtlı.');
      return;
    }

    const updatedStudent = { ...studentToEdit, ...data, id };

    try {
      await upsertStudent(updatedStudent);
      invalidate();
      reset();
      setEditOpen(false);
      setStudentToEdit(null);
      toast.success('Öğrenci başarıyla güncellendi.');
    } catch (error) {
      toast.error('Öğrenci güncellenemedi. Lütfen tekrar deneyin.');
      console.error('Failed to update student:', error);
    }
  };

  const onDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setConfirmationName('');
    setDeleteDialogOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!studentToDelete) return;

    const expectedName = `${studentToDelete.name} ${studentToDelete.surname}`.trim();
    if (confirmationName.trim() !== expectedName) {
      toast.error('Öğrencinin tam adını doğru yazmalısınız!');
      return;
    }

    try {
      const response = await fetch(STUDENT_ENDPOINTS.BY_ID(studentToDelete.id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationName: expectedName }),
      });

      const result = await response.json();

      if (result.success) {
        invalidate();
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setConfirmationName('');
        toast.success(`${expectedName} başarıyla silindi.`);
      } else {
        toast.error(result.error || 'Silme işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme işlemi sırasında hata oluştu.');
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedStudentIds);
    try {
      for (const id of idsToDelete) {
        await fetch(STUDENT_ENDPOINTS.BY_ID(id), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      }
      invalidate();
      setSelectedStudentIds(new Set());
      toast.success(`${idsToDelete.length} öğrenci silindi.`);
    } catch (error) {
      toast.error('Toplu silme işlemi başarısız oldu.');
      console.error('Bulk delete error:', error);
    }
  };

  const handleBulkUpdateRisk = async (risk: 'Düşük' | 'Orta' | 'Yüksek') => {
    const idsToUpdate = Array.from(selectedStudentIds);

    try {
      for (const id of idsToUpdate) {
        const student = students.find((s) => s.id === id);
        if (student) {
          await upsertStudent({ ...student, risk });
        }
      }
      invalidate();
      setSelectedStudentIds(new Set());
      toast.success(`${idsToUpdate.length} öğrencinin risk seviyesi güncellendi.`);
    } catch (error) {
      toast.error('Toplu güncelleme işlemi başarısız oldu.');
      console.error('Bulk update error:', error);
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedStudentIds(
        new Set(pagination.paginatedItems.map((s) => s.id))
      );
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectOne = (id: string, selected: boolean) => {
    const newSet = new Set(selectedStudentIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedStudentIds(newSet);
  };

  const handleColumnVisibilityChange = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const handleRowClick = (student: Student) => {
    setDrawerStudent(student);
    setDrawerOpen(true);
  };

  const importSheet = async (file: File) => {
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Dosya boyutu çok büyük. Maksimum 5MB dosya yükleyebilirsiniz.');
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        toast.error(
          'Desteklenmeyen dosya formatı. Sadece Excel (.xlsx, .xls) ve CSV (.csv) dosyaları desteklenmektedir.'
        );
        return;
      }

      const isCsv = ext === 'csv';
      let data: ArrayBuffer | Uint8Array;

      if (isCsv) {
        const buffer = await file.arrayBuffer();
        let decodedText: string;
        try {
          decodedText = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        } catch (utfError) {
          decodedText = new TextDecoder('windows-1254').decode(buffer);
        }
        data = new TextEncoder().encode(decodedText);
      } else {
        data = await file.arrayBuffer();
      }

      const wb = XLSX.read(data, { type: 'array', codepage: 65001 });
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        toast.error('Dosyada geçerli bir sayfa bulunamadı.');
        return;
      }

      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as unknown[][];

      if (!rows.length) {
        toast.error('Dosya boş veya geçerli veri içermiyor.');
        return;
      }

      if (rows.length > 10000) {
        toast.error('Dosyada çok fazla satır var. Maksimum 10.000 satır desteklenmektedir.');
        return;
      }

      const imported = parseImportedRows(rows);

      if (!imported.length) {
        toast.error('Dosyadan hiçbir geçerli öğrenci verisi bulunamadı.');
        return;
      }

      const updatedStudents = mergeStudents(students, imported);

      try {
        const response = await apiClient.post<ApiResponse>(
          STUDENT_ENDPOINTS.BULK,
          updatedStudents,
          {
            showSuccessToast: true,
            successMessage: `${imported.length} öğrenci başarıyla içe aktarıldı.`,
            showErrorToast: true,
          }
        );

        if (response.success) {
          toast.success(`${imported.length} öğrenci başarıyla içe aktarıldı.`);
        }

        invalidate();
      } catch (error) {
        console.error('Backend save error:', error);
        toast.error('Öğrenciler kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('File import error:', error);
      toast.error('Dosya içe aktarılırken hata oluştu. Lütfen dosya formatını kontrol edin.');
    }
  };

  const statsCardsData = [
    {
      title: "Toplam Öğrenci",
      value: stats.total,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      description: "Kayıtlı öğrenci",
      change: "+5%"
    },
    {
      title: "Erkek Öğrenci",
      value: stats.male,
      icon: UserCheck,
      gradient: "from-blue-500 to-cyan-600",
      description: "Erkek kayıt",
      change: `${stats.male}/${stats.total}`
    },
    {
      title: "Risk Altında",
      value: stats.highRisk,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      description: "Yüksek risk",
      change: "-3%"
    },
    {
      title: "Başarı Oranı",
      value: `%${Math.round(((stats.total - stats.highRisk) / stats.total) * 100 || 0)}`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      description: "Genel başarı",
      change: "+8%"
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700 p-6 md:p-8 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl">
          <Badge className="mb-3 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Öğrenci Yönetim Sistemi
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Öğrenciler
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl leading-relaxed">
            Tüm öğrenci kayıtlarını görüntüleyin, yönetin ve analiz edin. Modern arayüz ile hızlı ve kolay erişim.
          </p>
          <div className="flex flex-wrap gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Yeni Öğrenci Ekle
                </Button>
              </DialogTrigger>
              <StudentFormDialog
                onSubmit={handleSubmit(onCreate)}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                title="Yeni Öğrenci Ekle"
                submitText="Kaydet"
              />
            </Dialog>

            <label className="inline-flex items-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files && importSheet(e.target.files[0])}
              />
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" asChild>
                <span>
                  <Upload className="mr-2 h-5 w-5" />
                  İçe Aktar
                </span>
              </Button>
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Download className="mr-2 h-5 w-5" />
                  Dışa Aktar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Dışa Aktarma Formatı</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    exportToCSV(
                      selectedStudentIds.size > 0
                        ? students.filter((s) => selectedStudentIds.has(s.id))
                        : filters.filteredStudents
                    )
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  CSV Dosyası
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    exportToExcel(
                      selectedStudentIds.size > 0
                        ? students.filter((s) => selectedStudentIds.has(s.id))
                        : filters.filteredStudents
                    )
                  }
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel Dosyası
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    exportToPDF(
                      selectedStudentIds.size > 0
                        ? students.filter((s) => selectedStudentIds.has(s.id))
                        : filters.filteredStudents
                    )
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF Dosyası
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <motion.div
          className="absolute top-10 right-10 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Users className="h-32 w-32 text-white" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCardsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 hover:opacity-5 transition-opacity`}></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtreler ve Arama
                </CardTitle>
                <CardDescription>Öğrencileri hızlıca bulun ve filtreleyin</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <AdvancedFilters
                searchQuery={filters.filters.searchQuery}
                onSearchChange={filters.setSearchQuery}
                selectedClass={filters.filters.selectedClass}
                onClassChange={filters.setSelectedClass}
                selectedGender={filters.filters.selectedGender}
                onGenderChange={filters.setSelectedGender}
                selectedRisk={filters.filters.selectedRisk}
                onRiskChange={filters.setSelectedRisk}
                onResetFilters={filters.resetFilters}
                hasActiveFilters={filters.hasActiveFilters}
                activeFilterCount={filters.activeFilterCount}
              />
              {!isMobileView && (
                <TableControls
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                  pageSize={pagination.pageSize}
                  onPageSizeChange={pagination.setPageSize}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <BulkActions
        selectedCount={selectedStudentIds.size}
        onBulkDelete={handleBulkDelete}
        onBulkUpdateRisk={handleBulkUpdateRisk}
        onClearSelection={() => setSelectedStudentIds(new Set())}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {isLoading ? (
          <TableSkeleton />
        ) : students.length === 0 ? (
          <EmptyState variant="no-students" onAddStudent={() => setOpen(true)} />
        ) : filters.filteredStudents.length === 0 ? (
          <EmptyState variant="no-results" onClearFilters={filters.resetFilters} />
        ) : (
          <>
            {viewMode === 'grid' || isMobileView ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {pagination.paginatedItems.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <StudentCard
                      student={student}
                      isSelected={selectedStudentIds.has(student.id)}
                      onSelect={(selected) => handleSelectOne(student.id, selected)}
                      onEdit={onEditClick}
                      onDelete={onDeleteClick}
                      onView={handleRowClick}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EnhancedStudentTable
                students={pagination.paginatedItems}
                selectedIds={selectedStudentIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
                onRowClick={handleRowClick}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                columnVisibility={columnVisibility}
              />
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  {pagination.startIndex + 1}-{pagination.endIndex} arası gösteriliyor
                  (Toplam {pagination.totalItems} öğrenci)
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={pagination.previousPage}
                        className={
                          !pagination.canGoPrevious
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => pagination.setPage(pageNum)}
                            isActive={pageNum === pagination.currentPage}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={pagination.nextPage}
                        className={
                          !pagination.canGoNext
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </motion.div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <StudentFormDialog
          onSubmit={handleSubmit(onUpdate)}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          title="Öğrenci Düzenle"
          submitText="Değişiklikleri Kaydet"
          onCancel={() => {
            setEditOpen(false);
            setStudentToEdit(null);
            reset();
          }}
        />
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600 flex items-center gap-2">
              Öğrenci Silme Onayı
            </DialogTitle>
          </DialogHeader>
          {studentToDelete && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">
                  {studentToDelete.name} {studentToDelete.surname}
                </strong>{' '}
                öğrencisini kalıcı olarak silmek istediğinizden emin misiniz?
              </p>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold mb-1">
                  Bu işlem geri alınamaz!
                </p>
                <p className="text-xs text-red-700">
                  Tüm akademik kayıtlar, notlar ve ilerleme verileri kalıcı olarak silinecektir.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Silme işlemini onaylamak için öğrencinin tam adını yazın:
                </label>
                <Input
                  value={confirmationName}
                  onChange={(e) => setConfirmationName(e.target.value)}
                  placeholder={`${studentToDelete.name} ${studentToDelete.surname}`}
                  className="border-red-300 focus:border-red-500"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={!confirmationName.trim()}
              className="w-full sm:w-auto"
            >
              Kalıcı Olarak Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentDrawer
        student={drawerStudent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={onEditClick}
      />
    </div>
  );
}

function StudentFormDialog({
  onSubmit,
  register,
  setValue,
  watch,
  errors,
  title,
  submitText,
  onCancel,
}: {
  onSubmit: () => void;
  register: any;
  setValue: any;
  watch: any;
  errors: any;
  title: string;
  submitText: string;
  onCancel?: () => void;
}) {
  return (
    <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{title}</DialogTitle>
      </DialogHeader>
      <form
        id="student-form"
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Öğrenci No</label>
          <Input
            placeholder="12345"
            inputMode="numeric"
            type="text"
            {...register('id', {
              required: 'Öğrenci numarası zorunludur',
              pattern: {
                value: /^\d+$/,
                message: 'Öğrenci numarası sadece rakamlardan oluşmalıdır',
              },
            })}
          />
          {errors.id && <p className="text-xs text-red-600">{errors.id.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Ad</label>
          <Input
            placeholder="Ahmet"
            {...register('name', { required: 'Ad zorunludur' })}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Soyad</label>
          <Input
            placeholder="Yılmaz"
            {...register('surname', { required: 'Soyad zorunludur' })}
          />
          {errors.surname && <p className="text-xs text-red-600">{errors.surname.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sınıf</label>
          <Input placeholder="9/A" {...register('class')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cinsiyet</label>
          <Select
            onValueChange={(v) => setValue('gender', v as 'K' | 'E')}
            value={watch('gender')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="K">Kız</SelectItem>
              <SelectItem value="E">Erkek</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('gender')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Risk Seviyesi</label>
          <Select
            onValueChange={(v) => setValue('risk', v as 'Düşük' | 'Orta' | 'Yüksek')}
            value={watch('risk')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Düşük">Düşük</SelectItem>
              <SelectItem value="Orta">Orta</SelectItem>
              <SelectItem value="Yüksek">Yüksek</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('risk')} />
        </div>
      </form>
      <DialogFooter className="flex-col sm:flex-row gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            İptal
          </Button>
        )}
        <Button form="student-form" type="submit" className="w-full sm:w-auto">
          {submitText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
