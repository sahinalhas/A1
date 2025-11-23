export * from "./types/student.types";
export * from "./types/common.types";
export * from "./types/attendance.types";
export * from "./types/academic.types";
export * from "./types/study.types";
export * from "./types/coaching.types";
export * from "./types/family.types";

export type { SpecialEducation } from "@shared/types";

export * from "./api/endpoints/students.api";
export * from "./api/endpoints/notes.api";
export * from "./api/endpoints/documents.api";
export * from "./api/endpoints/attendance.api";
export * from "./api/endpoints/academic.api";
export * from "./api/endpoints/survey.api";
export * from "./api/endpoints/study.api";
export * from "./api/endpoints/coaching.api";
export * from "./api/endpoints/family.api";
export * from "./api/endpoints/risk.api";
export * from "./api/endpoints/student-profile.api";

export * from "./utils/formatters/templates";
export * from "./utils/helpers/study-planning";

export function defaultSeed() {
 return [
 {
 id:"1001",
 name:"Ayşe",
 surname:"Yılmaz",
 class:"9/A",
 gender:"K",
 risk:"Düşük",
 phone:"+90 555 111 22 33",
 parentName:"Fatma Yılmaz",
 parentContact:"+90 555 000 11 22",
 enrollmentDate: new Date().toISOString(),
 },
 {
 id:"1002",
 name:"Mehmet",
 surname:"Demir",
 class:"10/B",
 gender:"E",
 risk:"Orta",
 phone:"+90 555 333 44 55",
 enrollmentDate: new Date().toISOString(),
 },
 {
 id:"1003",
 name:"Zeynep",
 surname:"Kaya",
 class:"11/C",
 gender:"K",
 risk:"Yüksek",
 enrollmentDate: new Date().toISOString(),
 },
 {
 id:"1004",
 name:"Ali",
 surname:"Çelik",
 class:"12/A",
 gender:"E",
 risk:"Düşük",
 enrollmentDate: new Date().toISOString(),
 },
 ];
}

export async function planWeekSmart(
  studentId: string,
  weekStartISO: string
): Promise<PlannedEntry[]> {
  const topics = loadTopics();
  const subjects = loadSubjects();
  const slots = getWeeklySlotsByStudent(studentId).filter(
    (s) => s.start && s.end
  );
  const prog = getProgressByStudent(studentId);

  // Get topics due for review (spaced repetition)
  const dueForReview = getTopicsDueForReview(studentId);
  const upcomingReviews = getUpcomingReviews(studentId);

  const plan: PlannedEntry[] = [];

  for (const slot of slots) {
    const dayOfWeek = slot.day;
    const dateStr = dateFromWeekStart(weekStartISO, dayOfWeek);
    const slotStart = toMinutesHHmm(slot.start);
    const slotEnd = toMinutesHHmm(slot.end);
    const slotDuration = slotEnd - slotStart;

    const subjectTopics = topics.filter((t) => t.subjectId === slot.subjectId);

    const timeOfDay = getTimeOfDay(slotStart);

    const scored = subjectTopics
      .map((t) => {
        const p = prog.find((x) => x.topicId === t.id);
        const remaining = p ? p.remaining : t.avgMinutes;
        if (remaining <= 0 && !dueForReview.find(r => r.topicId === t.id)) return null;

        let score = 0;

        // PRIORITY 1: Spaced Repetition - topics due for review get highest priority
        const isDueForReview = dueForReview.find(r => r.topicId === t.id);
        if (isDueForReview) {
          score += 2000; // Highest priority
          const daysSinceLastStudy = p?.lastStudied 
            ? Math.floor((Date.now() - new Date(p.lastStudied).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          score += Math.min(daysSinceLastStudy * 50, 500); // More overdue = higher score
        }

        // PRIORITY 2: Upcoming reviews in next 7 days
        const isUpcomingReview = upcomingReviews.find(r => r.topicId === t.id);
        if (isUpcomingReview && !isDueForReview) {
          score += 800;
        }

        // PRIORITY 3: Deadline urgency
        if (t.deadline) {
          const daysUntil = getDaysUntilDeadline(t.deadline);
          if (daysUntil < 0) score += 1000;
          else if (daysUntil <= 3) score += 500;
          else if (daysUntil <= 7) score += 300;
          else if (daysUntil <= 14) score += 150;
        }

        // PRIORITY 4: Topic priority
        score += (t.priority || 5) * 20;

        // OPTIMIZATION: Energy level matching
        const energyMatch = matchEnergyLevel(timeOfDay, t.energyLevel);
        score += energyMatch * 100;

        // OPTIMIZATION: Difficulty matching
        const difficultyMatch = matchDifficulty(timeOfDay, t.difficultyScore);
        score += difficultyMatch * 50;

        // For review topics, allocate smaller chunks (15-30 min)
        const effectiveRemaining = isDueForReview || isUpcomingReview
          ? Math.min(30, remaining || 30)
          : remaining;

        return { topic: t, score, remaining: effectiveRemaining, isReview: !!(isDueForReview || isUpcomingReview) };
      })
      .filter((x) => x !== null) as {
      topic: StudyTopic;
      score: number;
      remaining: number;
      isReview: boolean;
    }[];

    scored.sort((a, b) => b.score - a.score);

    let allocated = 0;
    for (const { topic, remaining, isReview } of scored) {
      const needed = Math.min(remaining, slotDuration - allocated);
      if (needed <= 0) break;

      plan.push({
        date: dateStr,
        start: slot.start,
        end: slot.end,
        subjectId: slot.subjectId,
        topicId: topic.id,
        allocated: needed,
        remainingAfter: isReview ? 0 : remaining - needed, // Review topics don't reduce remaining
      });

      allocated += needed;
      if (allocated >= slotDuration) break;
    }
  }

  return plan;
}