/**
 * Gelişimsel Değerlendirmeler Sekmesi
 * Veri Kategorisi: Bilişsel ve Gelişimsel Profil
 * İçerik: Çoklu zeka, öğrenme stili, yetenek alanları, ilgi alanları
 */

import { Separator } from "@/components/atoms";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Brain, Sparkles } from "lucide-react";
import StandardizedTalentsSection from "@/components/features/student-profile/sections/StandardizedTalentsSection";
import { StudentData } from "@/hooks/features/student-profile";
import { motion } from "framer-motion";

interface DevelopmentalTabProps {
  studentId: string;
  data: StudentData;
  onUpdate: () => void;
}

export function DevelopmentalTab({ studentId, data, onUpdate }: DevelopmentalTabProps) {
  return (
    <div className="space-y-6">
      {/* Çoklu Zeka ve Öğrenme Stili */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              Bilişsel Profil & Öğrenme Tercihleri
            </CardTitle>
            <CardDescription>
              Çoklu zeka türleri, öğrenme stili ve bilişsel tercihler
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4 space-y-6">
          {/* Çoklu Zeka Bölümü */}
          {data.multipleIntelligence && (
            <div className="rounded-lg border p-4 bg-purple-50/30">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Çoklu Zeka Profili
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.multipleIntelligence)
                  .filter(([key]) => !['id', 'studentId', 'assessedAt', 'assessedBy', 'notes'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <div className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="font-semibold text-purple-700">{String(value)}/10</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Öğrenme Stili Bölümü */}
          {data.learningStyle && (
            <div className="rounded-lg border p-4 bg-blue-50/30">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Öğrenme Stili
              </h4>
              <div className="text-sm">
                <span className="font-medium">Birincil Stil: </span>
                <span className="text-blue-700">{data.learningStyle.primaryStyle}</span>
              </div>
              {data.learningStyle.secondaryStyle && (
                <div className="text-sm mt-1">
                  <span className="font-medium">İkincil Stil: </span>
                  <span className="text-blue-700">{data.learningStyle.secondaryStyle}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Yetenek ve İlgi Alanları */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Yetenek & İlgi Profili
            </CardTitle>
            <CardDescription>
              Yaratıcı yetenekler, fiziksel beceriler, ilgi alanları ve kulüp aktiviteleri
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <StandardizedTalentsSection
            studentId={studentId}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>
    </div>
  );
}
