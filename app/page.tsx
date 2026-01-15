"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { LabelList, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const BACKEND_API = "http://localhost:9000/predict";

type TrueOrFalseType = "True" | "False";
type SexType = "Male" | "Female";
type GenHealthType = "Excellent" | "Fair" | "Good" | "Poor" | "Very good";
type DiabeticType = "No" | "No (borderline diabetes)" | "Yes" | "Yes (during pregnancy)";
type RaceType = "American Indian/Alaskan Native" | "Asian" | "Black" | "Hispanic" | "White" | "Other";
type AgeCategoryType = "18-24" | "25-29" | "30-34" | "35-39" | "40-44" | "45-49" | "50-54" | "55-59" | "60-64" | "65-69" | "70-74" | "75-79" | "80 or older";

interface DataType {
	HeartDisease?: TrueOrFalseType;
	Tall?: number;
	Weight?: number;
	Smoking?: TrueOrFalseType;
	AlcoholDrinking?: TrueOrFalseType;
	Stroke?: TrueOrFalseType;
	PhysicalHealth?: number;
	MentalHealth?: number;
	DiffWalking?: TrueOrFalseType;
	Sex?: SexType;
	AgeCategory?: AgeCategoryType;
	Race?: RaceType;
	Diabetic?: DiabeticType;
	PhysicalActivity?: TrueOrFalseType;
	GenHealth?: GenHealthType;
	SleepTime?: number;
	Asthma?: TrueOrFalseType;
	KidneyDisease?: TrueOrFalseType;
}

interface ResultType {
	decision?: "Yes" | "No";
	posterior: { no: number; yes: number };
}

export default function Home() {
	const [data, setData] = useState<DataType>({
		HeartDisease: undefined,
		Tall: undefined,
		Weight: undefined,
		Smoking: undefined,
		AlcoholDrinking: undefined,
		Stroke: undefined,
		PhysicalHealth: undefined,
		MentalHealth: undefined,
		DiffWalking: undefined,
		Sex: undefined,
		AgeCategory: undefined,
		Race: undefined,
		Diabetic: undefined,
		PhysicalActivity: undefined,
		GenHealth: undefined,
		SleepTime: undefined,
		Asthma: undefined,
		KidneyDisease: undefined,
	});
	const [result, setResult] = useState<ResultType>({
		decision: undefined,
		posterior: { no: 0, yes: 0 },
	});

	function parseNumber(value: string) {
		const n = Number(value);
		return isNaN(n) ? undefined : n;
	}

	function clampNumber(n: number | undefined, min: number, max: number) {
		if (n === undefined) return undefined;
		return Math.min(Math.max(n, min), max);
	}

	async function requestToServer() {
		setResult((prev) => ({
			...prev,
			decision: undefined,
			posterior: {
				no: 0,
				yes: 0,
			},
		}));
		if (!data.Tall || !data.Weight) {
			alert("Tinggi dan berat wajib diisi");
			return;
		}
		const heightMeter = data.Tall / 100;
		const bmi = Number((data.Weight / (heightMeter * heightMeter)).toFixed(2));
		const payload = {
			...data,
			BMI: bmi,
			Tall: undefined,
			Weight: undefined,
		};
		const request = await fetch(`${BACKEND_API}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		const response = await request.json();
		if (response.success) {
			setResult((prev) => ({
				...prev,
				decision: response.data.decision,
				posterior: {
					no: response.data.posterior.no,
					yes: response.data.posterior.yes,
				},
			}));
		} else {
			setResult((prev) => ({
				...prev,
				decision: undefined,
				posterior: {
					no: 0,
					yes: 0,
				},
			}));
		}
	}

	return (
		<div className="max-w-5xl mx-auto my-8">
			<div>
				<h1 className="font-semibold text-xl text-center">Bayes Decision Theory</h1>
				<p className="font-medium text-md text-center">Deteksi Penyakit Kulit (Kanker)</p>
			</div>
			<div className="m-4 flex flex-col gap-8 mt-16">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{/* Jenis Kelamin */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="jenisKelamin">
								Jenis Kelamin<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.Sex}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										Sex: value as SexType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Jenis kelamin?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Male">Laki-laki</SelectItem>
									<SelectItem value="Female">Perempuan</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Kategori Usia */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="kategoriUsia">
								Kategori Usia<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.AgeCategory}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										AgeCategory: value as AgeCategoryType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Berapa kisaran usia anda?" />
								</SelectTrigger>
								<SelectContent>
									{["18-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80 or older"].map((value) => (
										<SelectItem
											key={value}
											value={value}
										>
											{value === "80 or older" ? "80 atau lebih" : value}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Ras */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="ras">
								Ras<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.Race}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										Race: value as RaceType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apa ras anda?" />
								</SelectTrigger>
								<SelectContent>
									{[
										{ label: "Penduduk Asli Amerika / Alaska", value: "American Indian/Alaskan Native" },
										{ label: "Asia", value: "Asian" },
										{ label: "Kulit Hitam", value: "Black" },
										{ label: "Hispanik / Latino", value: "Hispanic" },
										{ label: "Kulit Putih / Kaukasia", value: "White" },
										{ label: "Lainnya", value: "Other" },
									].map((value) => (
										<SelectItem
											key={value.value}
											value={value.value}
										>
											{value.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Tinggi Badan */}
					<div className="grid w-full items-center gap-3">
						<Label htmlFor="tinggiBadan">
							Tinggi Badan (cm)<span className="text-red-600 relative right-1">*</span>
							<InfoHover info={"Masukkan tinggi badan Anda dalam satuan sentimeter (cm). Contoh: 165"} />
						</Label>
						<Input
							type="number"
							id="tinggiBadan"
							placeholder="Tinggi Badan (cm)"
							value={data.Tall ?? ""}
							onChange={(e) =>
								setData((prev) => ({
									...prev,
									Tall: parseNumber(e.target.value),
								}))
							}
							onBlur={() =>
								setData((prev) => ({
									...prev,
									Tall: clampNumber(prev.Tall, 35, 180),
								}))
							}
						/>
					</div>

					{/* Berat Badan */}
					<div className="grid w-full items-center gap-3">
						<Label htmlFor="beratBadan">
							Berat Badan (kg)<span className="text-red-600 relative right-1">*</span>
							<InfoHover info={"Masukkan berat badan Anda dalam kilogram (kg). Contoh: 60"} />
						</Label>
						<Input
							type="number"
							id="beratBadan"
							placeholder="Berat Badan (kg)"
							value={data.Weight ?? ""}
							onChange={(e) =>
								setData((prev) => ({
									...prev,
									Weight: parseNumber(e.target.value),
								}))
							}
							onBlur={() =>
								setData((prev) => ({
									...prev,
									Weight: clampNumber(prev.Weight, 35, 180),
								}))
							}
						/>
					</div>

					{/* Merokok */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="merokok">
								Merokok<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.Smoking}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										Smoking: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda merokok?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Penyakit Jantung */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="PenyakitJantung">
								Penyakit Jantung<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.HeartDisease}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										HeartDisease: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda memiliki penyakit jantung?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Ginjal */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="penyakitGinjal">
								Penyakit Ginjal<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.KidneyDisease}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										KidneyDisease: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda memiliki penyakit ginjal?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Asma */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="asma">
								Asma<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.Asthma}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										Asthma: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda memiliki penyakit asma?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Diabetes */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="diabetes">
								Diabetes<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.Diabetic}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										Diabetic: value as DiabeticType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda memiliki penyakit diabetes?" />
								</SelectTrigger>
								<SelectContent>
									{[
										{ label: "Tidak", value: "No" },
										{ label: "Tidak (pra-diabetes / borderline)", value: "No (borderline diabetes)" },
										{ label: "Ya", value: "Yes" },
										{ label: "Ya (saat kehamilan)", value: "Yes (during pregnancy)" },
									].map((value, index) => {
										return (
											<SelectItem
												key={index}
												value={value.value}
											>
												{value.label}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Stroke */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="stroke">
								Stroke<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.Stroke}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										Stroke: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda stroke?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Mengkonsumsi Alkohol */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="konsumsiAlkohol">
								Mengkonsumsi Alkohol<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.AlcoholDrinking}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										AlcoholDrinking: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda mengkonsumsi alkohol?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{/* Kesehatan Fisik */}
					<div className="grid w-full items-center gap-3">
						<Label htmlFor="kesehatanFisik">
							Kesehatan Fisik (hari)<span className="text-red-600 relative right-1">*</span>
							<InfoHover info={"Jumlah hari dalam 30 hari terakhir saat tubuh Anda merasa tidak sehat (sakit, nyeri, lemas, dll). Isi 0–30."} />
						</Label>
						<Input
							type="number"
							id="kesehatanFisik"
							placeholder="Kesehatan Fisik (hari)"
							value={data.PhysicalHealth ?? ""}
							onChange={(e) =>
								setData((prev) => ({
									...prev,
									PhysicalHealth: parseNumber(e.target.value),
								}))
							}
							onBlur={() =>
								setData((prev) => ({
									...prev,
									PhysicalHealth: clampNumber(prev.PhysicalHealth, 0, 30),
								}))
							}
						/>
					</div>

					{/* Kesehatan Mental */}
					<div className="grid w-full items-center gap-3">
						<Label htmlFor="kesehatanMental">
							Kesehatan Mental (hari)<span className="text-red-600 relative right-1">*</span>
							<InfoHover info={"Jumlah hari dalam 30 hari terakhir saat kondisi mental Anda terasa buruk (stres, cemas, sedih, dll). Isi 0–30."} />
						</Label>
						<Input
							type="number"
							id="kesehatanMental"
							placeholder="Kesehatan Mental (hari)"
							value={data.MentalHealth ?? ""}
							onChange={(e) =>
								setData((prev) => ({
									...prev,
									MentalHealth: parseNumber(e.target.value),
								}))
							}
							onBlur={() =>
								setData((prev) => ({
									...prev,
									MentalHealth: clampNumber(prev.MentalHealth, 0, 30),
								}))
							}
						/>
					</div>

					{/* Kondisi Kesehatan */}
					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="kondisiKesehatan">
								Kondisi Kesehatan Umum<span className="text-red-600 relative right-1">*</span>
								<InfoHover info={"Penilaian umum Anda terhadap kondisi kesehatan saat ini, mulai dari Buruk hingga Istimewa."} />
							</FieldLabel>
							<Select
								value={data.GenHealth}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										GenHealth: value as GenHealthType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Kondisi kesahatan anda saat ini?" />
								</SelectTrigger>
								<SelectContent>
									{[
										{ label: "Istimewa", value: "Excellent" },
										{ label: "Sangat Baik", value: "Very good" },
										{ label: "Baik", value: "Good" },
										{ label: "Cukup", value: "Fair" },
										{ label: "Buruk", value: "Poor" },
									].map((value, index) => {
										return (
											<SelectItem
												key={index}
												value={value.value}
											>
												{value.label}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</Field>
					</div>

					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="sulitBerjalan">
								Sulit Berjalan<span className="text-red-600 relative right-1">*</span>
							</FieldLabel>
							<Select
								value={data.DiffWalking}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										DiffWalking: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda sulit berjalan?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					<div className="grid w-full items-center gap-3">
						<Field>
							<FieldLabel htmlFor="aktivitasFisik">
								Aktivitas Fisik<span className="text-red-600 relative right-1">*</span>
								<InfoHover info={"Apakah Anda melakukan aktivitas fisik atau olahraga dalam 30 hari terakhir?"} />
							</FieldLabel>
							<Select
								value={data.PhysicalActivity}
								onValueChange={(value) =>
									setData((prev) => ({
										...prev,
										PhysicalActivity: value as TrueOrFalseType,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Apakah anda sering beraktivitas fisik?" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="True">Iya</SelectItem>
									<SelectItem value="False">Tidak</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					<div className="grid w-full items-center gap-3">
						<Label htmlFor="jamTidur">
							Jam tidur akhir-akhir ini (jam)<span className="text-red-600 relative right-1">*</span>
							<InfoHover info={"Rata-rata jumlah jam tidur Anda per hari dalam beberapa waktu terakhir."} />
						</Label>
						<Input
							type="number"
							id="jamTidur"
							placeholder="Jam tidur akhir-akhir ini (jam)"
							value={data.SleepTime ?? ""}
							onChange={(e) =>
								setData((prev) => ({
									...prev,
									SleepTime: parseNumber(e.target.value),
								}))
							}
							onBlur={() =>
								setData((prev) => ({
									...prev,
									SleepTime: clampNumber(prev.SleepTime, 0, 24),
								}))
							}
						/>
					</div>
				</div>

				<Button
					className="cursor-pointer"
					onClick={() => requestToServer()}
				>
					Prediksi
				</Button>
				{result.decision && <ChartPieLabelList data={result} />}
			</div>
		</div>
	);
}

function InfoHover({ info }: { info: string }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="cursor-pointer text-blue-500">
						<Info size={16} />
					</span>
				</TooltipTrigger>
				<TooltipContent
					side="right"
					className="p-0 border-none bg-transparent"
				>
					<div className="w-72">
						<div className="rounded-xl border bg-background p-4 shadow-xl text-xs">
							<h4 className="font-semibold mb-1 text-slate-900">Informasi</h4>
							<p className="text-muted-foreground">{info}</p>
						</div>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export const description = "Hasil Analisis Bayes Decision Theory";
const chartConfig = { posterior: { label: "Probabilitas Posterior" } } satisfies ChartConfig;

export function ChartPieLabelList({ data }: { data: ResultType }) {
	return (
		<Card className="flex flex-col shadow-none">
			<CardHeader className="items-center pb-0">
				<CardTitle>Hasil Analisis Bayesian Decision Theory</CardTitle>
				<CardDescription>
					Analisis: <span className="font-semibold text-black">{data.decision === "Yes" ? "KANKER" : "TIDAK KANKER"}</span>
				</CardDescription>
			</CardHeader>

			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-80 [&_.recharts-text]:fill-foreground [&_.recharts-text]:opacity-100"
				>
					<PieChart>
						<ChartTooltip
							content={
								<ChartTooltipContent
									hideLabel
									className="text-sm px-3 py-2 min-w-50 font-semibold"
									formatter={(value, name) => [name, ` ${value}%`]}
								/>
							}
						/>
						<Pie
							data={[
								{ status: "Kanker", posterior: data.posterior.yes, fill: "#bf2828" },
								{ status: "Tidak Kanker", posterior: data.posterior.no, fill: "#13ad37" },
							]}
							dataKey="posterior"
							nameKey="status"
							outerRadius={150}
						>
							<LabelList
								dataKey="status"
								position="inside"
								offset={0}
								className="fill-foreground font-semibold"
								stroke="none"
								fontSize={13}
								color="#222222"
								formatter={(value) => value}
							/>
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
