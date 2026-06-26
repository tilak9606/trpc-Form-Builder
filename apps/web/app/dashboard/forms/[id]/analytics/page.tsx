"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Eye, MousePointerClick, CheckCircle2, TrendingUp } from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie,
    ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useGetAnalytics } from "~/hooks/api/form-submission";
import { NumberTicker } from "~/components/chrome/number-ticker";
import { TintCard } from "~/components/chrome/tint-card";
import { EditorialCard } from "~/components/chrome/editorial-card";
import { EmptyState } from "~/components/chrome/empty-state";
import { ProGate } from "~/components/pro-gate";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

const PIE_COLORS = [
    "var(--tint-sky)", "var(--tint-peach)", "var(--tint-mint)",
    "#8b5cf6", "var(--tint-blush)", "var(--tint-butter)", "var(--tint-lilac)",
];

const typeLabels: Record<string, string> = {
    TEXT: "Text", NUMBER: "Number", EMAIL: "Email", YES_NO: "Yes/No",
    PASSWORD: "Password", SELECT: "Select", MULTI_SELECT: "Multi Select",
    DATE: "Date", TEXTAREA: "Textarea", FILE_UPLOAD: "File Upload",
    RATING: "Rating", URL: "URL", PHONE: "Phone",
};

function formatDate(d: string) {
    try {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return d;
    }
}

const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: 12,
};

function FieldStats({ fa }: { fa: any }) {
    if (fa.type === "RATING") {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Avg: <strong className="text-foreground">{fa.breakdown.length > 0 ? (fa.breakdown.reduce((s: number, b: any) => s + Number(b.value) * b.count, 0) / Math.max(fa.breakdown.reduce((s: number, b: any) => s + b.count, 0), 1)).toFixed(1) : "—"}</strong></span>
                    <span>Total: <strong className="text-foreground">{fa.totalResponses}</strong></span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={fa.breakdown}>
                        <XAxis dataKey="value" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v}★`} />
                        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {fa.breakdown.map((_: any, i: number) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (fa.type === "NUMBER") {
        const avg = fa.breakdown.find((b: any) => b.value === "avg");
        const min = fa.breakdown.find((b: any) => b.value === "min");
        const max = fa.breakdown.find((b: any) => b.value === "max");
        return (
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Average", value: avg?.count ?? "—" },
                    { label: "Min", value: min?.count ?? "—" },
                    { label: "Max", value: max?.count ?? "—" },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-semibold mt-0.5">{stat.value}</p>
                    </div>
                ))}
            </div>
        );
    }

    if (fa.breakdown.length > 0) {
        return (
            <div className="flex items-center gap-6">
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie
                                data={fa.breakdown}
                                dataKey="count"
                                nameKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={2}
                            >
                                {fa.breakdown.map((_: any, i: number) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                    {fa.breakdown.map((b: any, i: number) => (
                        <div key={b.value} className="flex items-center gap-2 text-sm">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="flex-1 truncate">{b.value}</span>
                            <span className="tabular-nums text-muted-foreground">{b.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return <p className="text-sm text-muted-foreground">{fa.totalResponses} responses collected</p>;
}

export default function AnalyticsPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;
    const [selectedField, setSelectedField] = useState<string>("");

    const { form } = useGetFormWithFields(formId ?? "", "DRAFT");
    const { analytics, isLoading } = useGetAnalytics(formId ?? "");

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-10">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-3xl" />
                    ))}
                </div>
                <Skeleton className="h-72 rounded-2xl" />
            </div>
        );
    }

    const hasData = analytics && analytics.totalSubmissions > 0;
    const hasEvents = analytics && (analytics.totalViews > 0 || analytics.totalStarts > 0);

    return (
        <ProGate feature="Advanced Analytics" description="Get detailed insights into your form's performance with advanced analytics.">
        <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-10">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
                        {form?.title || "Analytics"}
                    </h1>
                    {hasData && (
                        <Badge variant="secondary" className="rounded-full">
                            {analytics.totalSubmissions} submissions
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">Response analytics and insights</p>
            </div>

            {!hasData ? (
                <EmptyState
                    illustration="analyze"
                    headline="No submissions yet"
                    description="Share your form to start collecting responses."
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <TintCard tint="sky">
                            <div className="flex items-center gap-2 opacity-70">
                                <Eye className="h-4 w-4" />
                                <span className="text-sm font-medium">Views</span>
                            </div>
                            <TintCard.Number>
                                <NumberTicker value={analytics.totalViews} />
                            </TintCard.Number>
                        </TintCard>

                        <TintCard tint="peach">
                            <div className="flex items-center gap-2 opacity-70">
                                <MousePointerClick className="h-4 w-4" />
                                <span className="text-sm font-medium">Starts</span>
                            </div>
                            <TintCard.Number>
                                <NumberTicker value={analytics.totalStarts} />
                            </TintCard.Number>
                        </TintCard>

                        <TintCard tint="mint">
                            <div className="flex items-center gap-2 opacity-70">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">Submissions</span>
                            </div>
                            <TintCard.Number>
                                <NumberTicker value={analytics.totalSubmissions} />
                            </TintCard.Number>
                        </TintCard>

                        <TintCard tint="forest">
                            <div className="flex items-center gap-2 opacity-70">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm font-medium">Completion</span>
                            </div>
                            <TintCard.Number>
                                <NumberTicker value={analytics.completionRate} suffix="%" />
                            </TintCard.Number>
                        </TintCard>
                    </div>

                    {hasEvents && (
                        <EditorialCard>
                            <h2 className="font-display text-lg font-semibold mb-4">Daily activity</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={mergeDailyData(analytics.dailyViews, analytics.dailyStarts, analytics.dailySubmissions)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        stroke="var(--muted-foreground)"
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Area type="monotone" dataKey="views" stackId="1" stroke="var(--tint-sky)" fill="var(--tint-sky)" fillOpacity={0.6} name="Views" />
                                    <Area type="monotone" dataKey="starts" stackId="1" stroke="var(--tint-peach)" fill="var(--tint-peach)" fillOpacity={0.6} name="Starts" />
                                    <Area type="monotone" dataKey="submissions" stackId="1" stroke="var(--tint-mint)" fill="var(--tint-mint)" fillOpacity={0.6} name="Submissions" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </EditorialCard>
                    )}

                    {!hasEvents && analytics.dailySubmissions.length > 0 && (
                        <EditorialCard>
                            <h2 className="font-display text-lg font-semibold mb-4">Submissions over time</h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={analytics.dailySubmissions}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickFormatter={formatDate} />
                                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="count" stroke="var(--tint-mint)" fill="var(--tint-mint)" fillOpacity={0.4} name="Submissions" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </EditorialCard>
                    )}

                    <EditorialCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-display text-lg font-semibold">Field breakdown</h2>
                            {analytics.fieldAnalytics.length > 1 && (
                                <Select value={selectedField} onValueChange={setSelectedField}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All fields" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">All fields</SelectItem>
                                        {analytics.fieldAnalytics.map((fa: any) => (
                                            <SelectItem key={fa.fieldId} value={fa.fieldId}>
                                                {fa.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {analytics.fieldAnalytics
                                .filter((fa: any) => !selectedField || selectedField === "__all__" || fa.fieldId === selectedField)
                                .map((fa: any) => (
                                    <div key={fa.fieldId} className="rounded-xl border border-border/60 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-medium">{fa.label}</p>
                                                <p className="text-xs text-muted-foreground">{typeLabels[fa.type] || fa.type}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs rounded-full">
                                                {fa.totalResponses}
                                            </Badge>
                                        </div>
                                        <FieldStats fa={fa} />
                                    </div>
                                ))}
                        </div>
                    </EditorialCard>
                </>
            )}
        </div>
        </ProGate>
    );
}

function mergeDailyData(views: any[], starts: any[], subs: any[]) {
    const dateMap = new Map<string, { date: string; views: number; starts: number; submissions: number }>();
    for (const d of views) {
        const key = String(d.date);
        if (!dateMap.has(key)) dateMap.set(key, { date: key, views: 0, starts: 0, submissions: 0 });
        dateMap.get(key)!.views = d.count;
    }
    for (const d of starts) {
        const key = String(d.date);
        if (!dateMap.has(key)) dateMap.set(key, { date: key, views: 0, starts: 0, submissions: 0 });
        dateMap.get(key)!.starts = d.count;
    }
    for (const d of subs) {
        const key = String(d.date);
        if (!dateMap.has(key)) dateMap.set(key, { date: key, views: 0, starts: 0, submissions: 0 });
        dateMap.get(key)!.submissions = d.count;
    }
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}
