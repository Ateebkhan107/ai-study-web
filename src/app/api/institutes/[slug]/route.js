import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext, getProfileMap } from "@/lib/instituteAuth";

function byCreatedDesc(a, b) {
  return String(b.created_at || "").localeCompare(String(a.created_at || ""));
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const context = await getInstituteContext(slug);
    if (context.error) return context.error;

    const { institute, role, actor, member } = context;
    const isAdmin = role === "COACHING_ADMIN";

    const [
      membersRes,
      batchesRes,
      testsRes,
      batchMembersRes,
      assignmentsRes,
      attemptsRes,
    ] = await Promise.all([
      supabaseAdmin.from("institute_members").select("*").eq("institute_id", institute.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("institute_batches").select("*").eq("institute_id", institute.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("institute_tests").select("*").eq("institute_id", institute.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("institute_batch_members").select("*").eq("institute_id", institute.id),
      supabaseAdmin.from("institute_test_assignments").select("*").eq("institute_id", institute.id),
      supabaseAdmin
        .from("institute_test_attempts")
        .select("*, test_attempts(*)")
        .eq("institute_id", institute.id)
        .order("started_at", { ascending: false }),
    ]);

    for (const result of [membersRes, batchesRes, testsRes, batchMembersRes, assignmentsRes, attemptsRes]) {
      if (result.error) throw result.error;
    }

    const members = membersRes.data || [];
    const batches = batchesRes.data || [];
    const tests = testsRes.data || [];
    const batchMembers = batchMembersRes.data || [];
    const assignments = assignmentsRes.data || [];
    const allAttempts = attemptsRes.data || [];
    const profiles = await getProfileMap([
      ...members.map((row) => row.user_id),
      ...allAttempts.map((row) => row.user_id),
    ]);

    const activeMember = member || members.find((row) => row.user_id === actor.userId);
    const activeStudentMembers = members.filter((row) => row.role === "STUDENT" && row.status === "ACTIVE");
    const myBatchIds = new Set(
      batchMembers
        .filter((row) => row.member_id === activeMember?.id)
        .map((row) => row.batch_id)
    );
    const myBatchMemberIds = new Set(
      batchMembers
        .filter((row) => myBatchIds.has(row.batch_id))
        .map((row) => row.member_id)
    );
    const memberByUserId = new Map(members.map((row) => [row.user_id, row]));
    const studentAssignedTestIds = new Set(
      assignments
        .filter((row) => myBatchIds.has(row.batch_id))
        .map((row) => row.institute_test_id)
    );
    const studentAttempts = allAttempts.filter((row) => row.user_id === actor.userId);
    const latestAttemptByTest = new Map();
    studentAttempts.forEach((row) => {
      if (!latestAttemptByTest.has(row.institute_test_id)) {
        latestAttemptByTest.set(row.institute_test_id, row);
      }
    });

    const assignedTests = tests
      .filter((test) => test.status === "PUBLISHED" && studentAssignedTestIds.has(test.id))
      .map((test) => ({
        ...test,
        latest_attempt: latestAttemptByTest.get(test.id) || null,
      }));

    const visibleAttempts = isAdmin ? allAttempts : studentAttempts;
    const submittedAttempts = visibleAttempts.filter((row) => row.status === "SUBMITTED");
    const submittedAdminAttempts = allAttempts.filter((row) => row.status === "SUBMITTED");
    const testById = new Map(tests.map((test) => [test.id, test]));
    const batchById = new Map(batches.map((batch) => [batch.id, batch]));
    const assignedBatchIdsByTest = assignments.reduce((map, assignment) => {
      const current = map.get(assignment.institute_test_id) || [];
      current.push(assignment.batch_id);
      map.set(assignment.institute_test_id, current);
      return map;
    }, new Map());

    const adminAnalyticsAttempts = submittedAdminAttempts.map((row) => {
      const result = row.test_attempts || {};
      const test = testById.get(row.institute_test_id) || null;
      const totalMarks = result.total_marks || (test?.total_questions || 0) * 4;
      const score = Number(result.score) || 0;
      const attempted = Number(result.attempted) || 0;
      const correct = Number(result.correct_answers) || 0;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      return {
        row,
        result,
        test,
        score,
        totalMarks,
        scorePercent: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0,
        accuracy,
        timeTaken: Number(result.time_taken_seconds) || 0,
      };
    });

    const studentScoreMap = new Map();
    adminAnalyticsAttempts.forEach((attempt) => {
      const current = studentScoreMap.get(attempt.row.user_id) || { user_id: attempt.row.user_id, attempts: 0, score: 0, accuracy: 0 };
      current.attempts += 1;
      current.score += attempt.score;
      current.accuracy += attempt.accuracy;
      studentScoreMap.set(attempt.row.user_id, current);
    });
    const topStudent = [...studentScoreMap.values()]
      .map((row) => ({
        ...row,
        average_score: Math.round(row.score / row.attempts),
        average_accuracy: Math.round(row.accuracy / row.attempts),
        profile: profiles[row.user_id] || null,
      }))
      .sort((a, b) => b.average_score - a.average_score || b.average_accuracy - a.average_accuracy)[0] || null;

    const testBreakdown = tests.map((test) => {
      const attemptsForTest = adminAnalyticsAttempts.filter((attempt) => attempt.row.institute_test_id === test.id);
      return {
        id: test.id,
        title: test.title,
        subject: test.subject,
        submissions: attemptsForTest.length,
        average_score_percent: average(attemptsForTest.map((attempt) => attempt.scorePercent)),
        average_accuracy: average(attemptsForTest.map((attempt) => attempt.accuracy)),
      };
    }).sort((a, b) => b.submissions - a.submissions).slice(0, 6);

    const batchBreakdown = batches.map((batch) => {
      const batchMemberIds = new Set(batchMembers.filter((row) => row.batch_id === batch.id).map((row) => row.member_id));
      const batchUserIds = new Set(members.filter((row) => batchMemberIds.has(row.id)).map((row) => row.user_id));
      const batchTestIds = new Set(assignments.filter((row) => row.batch_id === batch.id).map((row) => row.institute_test_id));
      const attemptsForBatch = adminAnalyticsAttempts.filter((attempt) =>
        batchUserIds.has(attempt.row.user_id) && batchTestIds.has(attempt.row.institute_test_id)
      );
      return {
        id: batch.id,
        name: batch.name,
        exam: batch.exam,
        students: batchUserIds.size,
        assigned_tests: batchTestIds.size,
        submissions: attemptsForBatch.length,
        average_score_percent: average(attemptsForBatch.map((attempt) => attempt.scorePercent)),
        average_accuracy: average(attemptsForBatch.map((attempt) => attempt.accuracy)),
      };
    }).sort((a, b) => b.submissions - a.submissions).slice(0, 6);

    const trendMap = new Map();
    adminAnalyticsAttempts.forEach((attempt) => {
      const date = String(attempt.row.submitted_at || attempt.result.submitted_at || attempt.row.started_at || "").slice(0, 10);
      if (!date) return;
      const current = trendMap.get(date) || { date, submissions: 0, scorePercentTotal: 0 };
      current.submissions += 1;
      current.scorePercentTotal += attempt.scorePercent;
      trendMap.set(date, current);
    });
    const trend = [...trendMap.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((row) => ({
        date: row.date,
        submissions: row.submissions,
        average_score_percent: Math.round(row.scorePercentTotal / row.submissions),
      }));

    const analytics = isAdmin ? {
      summary: {
        submissions: adminAnalyticsAttempts.length,
        completion_rate: tests.length && activeStudentMembers.length
          ? Math.round((adminAnalyticsAttempts.length / Math.max(tests.length * activeStudentMembers.length, 1)) * 100)
          : 0,
        average_score_percent: average(adminAnalyticsAttempts.map((attempt) => attempt.scorePercent)),
        average_accuracy: average(adminAnalyticsAttempts.map((attempt) => attempt.accuracy)),
        average_time_minutes: average(adminAnalyticsAttempts.map((attempt) => Math.round(attempt.timeTaken / 60))),
        top_student: topStudent,
      },
      trend,
      test_breakdown: testBreakdown,
      batch_breakdown: batchBreakdown,
    } : null;
    const studentLeaderboards = assignedTests.map((test) => ({
      test,
      rows: allAttempts
        .filter((row) => {
          const rowMember = memberByUserId.get(row.user_id);
          return row.status === "SUBMITTED" &&
            row.institute_test_id === test.id &&
            rowMember &&
            myBatchMemberIds.has(rowMember.id);
        })
        .map((row) => {
          const result = row.test_attempts || {};
          return {
            id: row.id,
            user_id: row.user_id,
            student: profiles[row.user_id] || null,
            score: result.score || 0,
            total_marks: result.total_marks || test.total_questions * 4,
            time_taken_seconds: result.time_taken_seconds || 0,
          };
        })
        .sort((a, b) => b.score - a.score || a.time_taken_seconds - b.time_taken_seconds)
        .map((row, index) => ({ ...row, rank: index + 1 })),
    }));

    return NextResponse.json({
      institute,
      role,
      stats: {
        students: isAdmin ? activeStudentMembers.length : myBatchMemberIds.size,
        pending_students: members.filter((row) => row.role === "STUDENT" && row.status === "PENDING").length,
        batches: isAdmin ? batches.length : myBatchIds.size,
        tests: isAdmin ? tests.length : assignedTests.length,
        attempts: visibleAttempts.filter((row) => row.status === "SUBMITTED").length,
      },
      members: isAdmin ? members.map((row) => ({ ...row, profile: profiles[row.user_id] || null })) : [],
      batches: isAdmin
        ? batches.map((batch) => ({
          ...batch,
          member_count: batchMembers.filter((row) => row.batch_id === batch.id).length,
        }))
        : batches.filter((batch) => myBatchIds.has(batch.id)),
      tests: isAdmin ? tests : assignedTests,
      assignments: isAdmin ? assignments : [],
      analytics,
      student_leaderboards: isAdmin ? [] : studentLeaderboards,
      recent_results: visibleAttempts
        .filter((row) => row.status === "SUBMITTED")
        .sort(byCreatedDesc)
        .slice(0, 8)
        .map((row) => ({
          ...row,
          student: profiles[row.user_id] || null,
          test: tests.find((test) => test.id === row.institute_test_id) || null,
        })),
    });
  } catch (error) {
    console.error("[INSTITUTE_DASHBOARD_ERROR]", error);
    return NextResponse.json({ error: "Failed to load institute" }, { status: 500 });
  }
}
