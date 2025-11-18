import { Card, CardContent } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Eye, Pencil, Trash2, User, GraduationCap, AlertTriangle } from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';

interface StudentCardProps {
 student: Student;
 isSelected?: boolean;
 onSelect?: (selected: boolean) => void;
 onEdit?: (student: Student) => void;
 onDelete?: (student: Student) => void;
 onView?: (student: Student) => void;
}

export function StudentCard({
 student,
 isSelected = false,
 onSelect,
 onEdit,
 onDelete,
 onView,
}: StudentCardProps) {
 const getRiskColor = (risk?: string) => {
 switch (risk) {
 case 'Yüksek':
 return 'border-red-500/30 bg-red-500/5';
 case 'Orta':
 return 'border-yellow-500/30 bg-yellow-500/5';
 default:
 return 'border-green-500/30 bg-green-500/5';
 }
 };

 const getRiskBadgeVariant = (risk?: string) => {
 switch (risk) {
 case 'Yüksek':
 return 'destructive';
 case 'Orta':
 return 'default';
 default:
 return 'secondary';
 }
 };

 return (
 <Card
 className={` transition-all ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${getRiskColor(student.risk)}`}
 >
 <CardContent className="p-4">
 <div className="space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-3 flex-1">
 {onSelect && (
 <Checkbox
 checked={isSelected}
 onCheckedChange={onSelect}
 className="mt-1"
 />
 )}
 <div
 className="flex-1 cursor-pointer"
 onClick={() => onView?.(student)}
 >
 <div className="flex items-center gap-2 mb-1">
 <div className="rounded-full bg-primary/10 p-1.5">
 <User className="h-3.5 w-3.5 text-primary" />
 </div>
 <h3 className="font-semibold text-base">
 {student.name} {student.surname}
 </h3>
 </div>
 <p className="text-xs text-muted-foreground mb-2">
 Öğrenci No: {student.id}
 </p>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap gap-2">
 <Badge variant="outline" className="text-xs">
 <GraduationCap className="mr-1 h-3 w-3" />
 {student.class}
 </Badge>
 <Badge variant="outline" className="text-xs">
 {student.gender === 'E' ? 'Erkek' : 'Kız'}
 </Badge>
 <Badge variant={getRiskBadgeVariant(student.risk)} className="text-xs">
 <AlertTriangle className="mr-1 h-3 w-3" />
 {student.risk || 'Düşük'}
 </Badge>
 </div>

 <div className="flex gap-2 pt-2 border-t">
 <Button
 asChild
 size="sm"
 variant="outline"
 className="flex-1 text-xs h-8"
 >
 <Link to={`/ogrenci/${student.id}`}>
 <Eye className="mr-1 h-3 w-3" />
 Görüntüle
 </Link>
 </Button>
 {onEdit && (
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onEdit(student)}
 className="h-8 px-2"
 >
 <Pencil className="h-3.5 w-3.5" />
 </Button>
 )}
 {onDelete && (
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onDelete(student)}
 className="h-8 px-2 text-destructive"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 );
}
