"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useGetAnalytics } from "~/hooks/api/form-submission";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#a855f7", "#84cc16"];

const typeLabels: Record<string, string> = {
    TEXT: "Text", NUMBER: "Number", EMAIL: "Email", YES_NO: "Yes/No",
    PASSWORD: "Password", SELECT: "Select", MULTI_SELECT: "Multi Select",
    DATE: "Date", TEXTAREA: "Textarea", FILE_UPLOAD: "File Upload",
};

export default function AnalyticsPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { form } = useGetFormWithFields(formId ?? "");
    const { analytics, isLoading } = useGetAnalytics(formId ?? "");

    if (isLoading) return <div className="p-8 animate-pulse">Loading analytics...</div>;

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/dashboard/forms/${formId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold">{form?.title || "Analytics"}</h1>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {analytics?.totalSubmissions ?? 0} submissions
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Response analytics and insights</p>
                </div>
            </div>

            {(!analytics || analytics.totalSubmissions === 0) ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No submissions yet. Share your form to start collecting responses.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <p className="text-sm text-muted-foreground">Total submissions</p>
                            <p className="text-3xl font-semibold mt-1">{analytics.totalSubmissions}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <p className="text-sm text-muted-foreground">Total fields</p>
                            <p className="text-3xl font-semibold mt-1">{analytics.fieldAnalytics.length}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <p className="text-sm text-muted-foreground">Days with submissions</p>
                            <p className="text-3xl font-semibold mt-1">{analytics.dailySubmissions.length}</p>
                        </div>
                    </div>

                    {/* Daily Submissions Line Chart */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-medium mb-4">Submissions over time</h2>
                        {analytics.dailySubmissions.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={analytics.dailySubmissions}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                            color: "hsl(var(--card-foreground))",
                                        }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-muted-foreground">Not enough data to show a trend.</p>
                        )}
                    </div>

                    {/* Field Breakdown Cards */}
                    <div>
                        <h2 className="text-sm font-medium mb-4">Field breakdown</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analytics.fieldAnalytics.map((fa: any) => (
                                <div key={fa.fieldId} className="rounded-2xl border border-border bg-card p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-medium">{fa.label}</p>
                                            <p className="text-xs text-muted-foreground">{typeLabels[fa.type] || fa.type}</p>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {fa.totalResponses} responses
                                        </span>
                                    </div>
                                    {fa.breakdown.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={fa.breakdown}>
                                                <XAxis dataKey="value" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "hsl(var(--card))",
                                                        border: "1px solid hsl(var(--border))",
                                                        borderRadius: "8px",
                                                        color: "hsl(var(--card-foreground))",
                                                    }}
                                                />
                                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                    {fa.breakdown.map((_: any, i: number) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{fa.totalResponses} responses collected</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
