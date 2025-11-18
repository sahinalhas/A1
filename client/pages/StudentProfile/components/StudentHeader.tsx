import { Card, CardHeader, CardContent } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Avatar, AvatarFallback } from "@/components/atoms/Avatar";
import { User, GraduationCap, ShieldAlert, Sparkles, Calendar, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Student } from "@/lib/storage";
import { RiskPill } from "./RiskPill";

interface StudentHeaderProps {
 student: Student;
}

export function StudentHeader({ student }: StudentHeaderProps) {
 const fullName = `${student.name} ${student.surname}`;
 const currentYear = new Date().getFullYear();
 const birthYear = student.birthDate ? new Date(student.birthDate).getFullYear() : currentYear;
 const age = currentYear - birthYear;
 
 const initials = `${student.name.charAt(0)}${student.surname.charAt(0)}`.toUpperCase();
 
 const getGenderColor = (gender?: string) => {
 if (gender ==="K") return"from-pink-500 to-purple-500";
 if (gender ==="E") return"from-blue-500 to-cyan-500";
 return"from-gray-500 to-slate-500";
 };

 return (
 <>
 {/* Back Button */}
 <Button 
 asChild 
 variant="ghost" 
 className="mb-3"
 >
 <Link to="/ogrenci" className="gap-2">
 <ArrowLeft className="h-4 w-4" />
 Öğrenci Listesine Dön
 </Link>
 </Button>

 {/* Minimal Modern Header */}
 <Card className="relative overflow-hidden border border-border/50 bg-gradient-to-br from-background via-background to-primary/5">
 {/* Subtle Background Accent */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10"></div>
 
 <CardHeader className="p-4 md:p-6">
 <div className="flex items-start gap-4">
 {/* Compact Avatar */}
 <Avatar className={`h-16 w-16 md:h-20 md:w-20 border-2 border-white bg-gradient-to-br ${getGenderColor(student.gender)} flex-shrink-0`}>
 <AvatarFallback className="text-xl md:text-2xl font-bold text-white">
 {initials}
 </AvatarFallback>
 </Avatar>

 {/* Student Info - Compact */}
 <div className="flex-1 min-w-0">
 {/* Name and Risk */}
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex-1 min-w-0">
 <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
 {fullName}
 </h1>
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
 <span className="font-medium">Risk:</span>
 <RiskPill risk={student.risk} />
 </div>
 </div>
 
 {/* Action Button - Compact */}
 <Button 
 asChild 
 size="sm"
 className="gap-1.5 flex-shrink-0"
 >
 <Link to={`/ogrenci/${student.id}/gelismis-analiz`}>
 <Sparkles className="h-4 w-4" />
 <span className="hidden sm:inline">Gelişmiş Analiz</span>
 <span className="sm:hidden">Analiz</span>
 </Link>
 </Button>
 </div>
 
 {/* Compact Badges */}
 <div className="flex flex-wrap items-center gap-1.5 mb-2">
 <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
 <GraduationCap className="h-3 w-3 mr-1" />
 {student.class}
 </Badge>
 
 <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
 {student.gender ==="K" ?"Kız" :"Erkek"}
 </Badge>
 
 <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
 <Calendar className="h-3 w-3 mr-1" />
 {age} yaş
 </Badge>

 {student.studentNumber && (
 <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
 <User className="h-3 w-3 mr-1" />
 {student.studentNumber}
 </Badge>
 )}
 </div>

 {/* Contact Info - Compact Grid */}
 {(student.email || student.phone || student.address) && (
 <div className="flex flex-wrap gap-2 text-xs">
 {student.email && (
 <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 rounded px-2 py-1">
 <Mail className="h-3 w-3 text-primary flex-shrink-0" />
 <span className="truncate max-w-[150px]">{student.email}</span>
 </div>
 )}
 {student.phone && (
 <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 rounded px-2 py-1">
 <Phone className="h-3 w-3 text-primary flex-shrink-0" />
 <span>{student.phone}</span>
 </div>
 )}
 {student.address && (
 <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 rounded px-2 py-1 max-w-full">
 <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
 <span className="truncate">{student.address}</span>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </CardHeader>
 </Card>
 </>
 );
}
