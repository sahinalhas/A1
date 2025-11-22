import { Card, CardContent } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Eye, Pencil, Trash2, User, GraduationCap, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
 const getRiskConfig = (risk?: string) => {
 switch (risk) {
 case 'Yüksek':
 return {
 gradient: 'from-red-500/10 to-red-600/5',
 border: 'border-red-500/20',
 glow: 'shadow-red-500/10',
 badge: 'bg-red-500/10 text-red-700 border-red-500/20',
 icon: 'text-red-600'
 };
 case 'Orta':
 return {
 gradient: 'from-amber-500/10 to-orange-600/5',
 border: 'border-amber-500/20',
 glow: 'shadow-amber-500/10',
 badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
 icon: 'text-amber-600'
 };
 default:
 return {
 gradient: 'from-emerald-500/10 to-teal-600/5',
 border: 'border-emerald-500/20',
 glow: 'shadow-emerald-500/10',
 badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
 icon: 'text-emerald-600'
 };
 }
 };

 const riskConfig = getRiskConfig(student.risk);

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -4, scale: 1.01 }}
 transition={{ duration: 0.2 }}
 >
 <Card
 className={`
 group relative overflow-hidden border backdrop-blur-xl bg-gradient-to-br ${riskConfig.gradient}
 hover:shadow-xl transition-all duration-300 ${riskConfig.border} ${riskConfig.glow}
 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
 `}
 >
 <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/0 dark:from-white/5 dark:to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
 
 <CardContent className="p-4 md:p-5 relative">
 <div className="space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-3 flex-1 min-w-0">
 {onSelect && (
 <Checkbox
 checked={isSelected}
 onCheckedChange={onSelect}
 className="mt-1.5 flex-shrink-0"
 />
 )}
 <div
 className="flex-1 cursor-pointer min-w-0"
 onClick={() => onView?.(student)}
 >
 <div className="flex items-center gap-2.5 mb-2">
 <div className={`rounded-full bg-gradient-to-br from-violet-500 to-purple-600 p-2 shadow-lg`}>
 <User className="h-4 w-4 text-white" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-base md:text-lg truncate">
 {student.name} {student.surname}
 </h3>
 <p className="text-[10px] md:text-xs text-muted-foreground">
 No: {student.id}
 </p>
 </div>
 </div>
 </div>
 </div>
 <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
 </div>

 <div className="flex flex-wrap gap-1.5 md:gap-2">
 <Badge variant="outline" className="text-[10px] md:text-xs border-violet-500/30 bg-violet-500/5">
 <GraduationCap className="mr-1 h-3 w-3" />
 {student.class}
 </Badge>
 <Badge variant="outline" className="text-[10px] md:text-xs border-blue-500/30 bg-blue-500/5">
 {student.gender === 'E' ? 'Erkek' : 'Kız'}
 </Badge>
 <Badge className={`text-[10px] md:text-xs border ${riskConfig.badge}`}>
 <AlertTriangle className={`mr-1 h-3 w-3 ${riskConfig.icon}`} />
 {student.risk || 'Düşük'}
 </Badge>
 </div>

 <div className="flex gap-2 pt-3 border-t border-border/50">
 <Button
 asChild
 size="sm"
 variant="outline"
 className="flex-1 text-xs h-9 hover:bg-primary/10 hover:border-primary/30 transition-colors"
 >
 <Link to={`/ogrenci/${student.id}`}>
 <Eye className="mr-1.5 h-3.5 w-3.5" />
 Görüntüle
 </Link>
 </Button>
 {onEdit && (
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onEdit(student)}
 className="h-9 px-3 hover:bg-primary/10 transition-colors"
 >
 <Pencil className="h-3.5 w-3.5" />
 </Button>
 )}
 {onDelete && (
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onDelete(student)}
 className="h-9 px-3 text-destructive hover:bg-destructive/10 transition-colors"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}
