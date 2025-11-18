import { toast } from "sonner";
import type { ScheduleTemplate, WeeklySlot, StudySubject } from "../../types/study.types";
import { 
  loadSubjects, 
  loadSubjectsAsync, 
  saveSubjects,
  getWeeklySlotsByStudent,
  removeWeeklySlot
} from "../../api/endpoints/study.api";

const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: 'lgs-balanced',
    name: 'LGS Dengeli Program',
    description: 'Hafta içi günde 3 saat, hafta sonu 4 saat çalışma',
    category: 'LGS',
    estimatedWeeklyHours: 20.5,
    difficulty: 'Orta',
    tags: ['lgs', 'dengeli', '8.sınıf'],
    subjects: [
      { id: 'mat-lgs', name: 'Matematik', category: 'LGS' },
      { id: 'fen-lgs', name: 'Fen Bilimleri', category: 'LGS' },
      { id: 'tur-lgs', name: 'Türkçe', category: 'LGS' },
      { id: 'sos-lgs', name: 'Sosyal Bilgiler', category: 'LGS' },
      { id: 'ing-lgs', name: 'İngilizce', category: 'LGS' },
      { id: 'din-lgs', name: 'Din Kültürü', category: 'LGS' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '18:30', subjectId: 'mat-lgs' },
      { day: 1, start: '19:00', end: '20:00', subjectId: 'tur-lgs' },
      { day: 2, start: '17:00', end: '18:30', subjectId: 'fen-lgs' },
      { day: 2, start: '19:00', end: '20:00', subjectId: 'ing-lgs' },
      { day: 3, start: '17:00', end: '18:30', subjectId: 'mat-lgs' },
      { day: 3, start: '19:00', end: '20:00', subjectId: 'sos-lgs' },
      { day: 4, start: '17:00', end: '18:30', subjectId: 'fen-lgs' },
      { day: 4, start: '19:00', end: '20:00', subjectId: 'din-lgs' },
      { day: 5, start: '17:00', end: '18:30', subjectId: 'mat-lgs' },
      { day: 5, start: '19:00', end: '20:00', subjectId: 'tur-lgs' },
      { day: 6, start: '10:00', end: '12:00', subjectId: 'mat-lgs' },
      { day: 6, start: '14:00', end: '16:00', subjectId: 'fen-lgs' },
      { day: 7, start: '10:00', end: '12:00', subjectId: 'sos-lgs' },
      { day: 7, start: '14:00', end: '16:00', subjectId: 'tur-lgs' }
    ]
  }
];

export function getScheduleTemplates(): ScheduleTemplate[] {
  return SCHEDULE_TEMPLATES;
}

export function getTemplatesByCategory(category?: string): ScheduleTemplate[] {
  if (!category || category === 'Tümü') {
    return SCHEDULE_TEMPLATES;
  }
  return SCHEDULE_TEMPLATES.filter(t => t.category === category);
}

export async function applyScheduleTemplate(
  templateId: string,
  studentId: string,
  replaceExisting: boolean = false
): Promise<void> {
  const template = SCHEDULE_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    toast.error('Şablon bulunamadı');
    return;
  }

  try {
    if (replaceExisting) {
      const existing = getWeeklySlotsByStudent(studentId);
      for (const slot of existing) {
        await removeWeeklySlot(slot.id);
      }
    }

    await loadSubjectsAsync();
    const existingSubjects = loadSubjects();
    
    const subjectIdMap = new Map<string, string>();
    const subjectsToAdd: StudySubject[] = [];
    
    for (const templateSubject of template.subjects) {
      const existing = existingSubjects.find(s => 
        s.name.toLowerCase() === templateSubject.name.toLowerCase() && 
        s.category === templateSubject.category
      );
      
      if (existing) {
        subjectIdMap.set(templateSubject.id, existing.id);
      } else {
        const newSubject: StudySubject = {
          id: crypto.randomUUID(),
          name: templateSubject.name,
          category: templateSubject.category as any,
          code: templateSubject.name.toLowerCase().replace(/\s+/g, '-'),
          description: `${template.name} şablonundan eklendi`
        };
        subjectsToAdd.push(newSubject);
        subjectIdMap.set(templateSubject.id, newSubject.id);
      }
    }
    
    if (subjectsToAdd.length > 0) {
      const allSubjects = [...existingSubjects, ...subjectsToAdd];
      await saveSubjects(allSubjects);
    }

    const newSlots: WeeklySlot[] = template.slots.map(templateSlot => ({
      id: crypto.randomUUID(),
      studentId,
      day: templateSlot.day,
      start: templateSlot.start,
      end: templateSlot.end,
      subjectId: subjectIdMap.get(templateSlot.subjectId) || templateSlot.subjectId
    }));
    
    const response = await fetch('/api/weekly-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSlots)
    });
    
    if (!response.ok) {
      throw new Error('Failed to add weekly slots');
    }
    
    window.dispatchEvent(new CustomEvent('weeklySlotsUpdated'));

    toast.success(`"${template.name}" şablonu uygulandı`, {
      description: `${template.estimatedWeeklyHours} saatlik program eklendi`
    });
  } catch (error) {
    console.error('Error applying template:', error);
    toast.error('Şablon uygulanırken hata oluştu');
    throw error;
  }
}
