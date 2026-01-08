"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BACKEND_API = "http://72.62.121.253:9000/predict";

type PredictionItem = {
	disease: string;
	probability: number;
};

type PredictType = {
	diagnosis: {
		disease: string | null;
		probability: number | null;
	};
	top3: PredictionItem[];
};

export default function Home() {
	const [image, setImage] = useState<File | null>(null);
	const [predict, setPredict] = useState<PredictType>({
		diagnosis: {
			disease: null,
			probability: null,
		},
		top3: [],
	});

	async function requestToServer() {
		if (!image) return alert("Upload gambar dulu!");
		const formData = new FormData();
		formData.append("image", image);
		try {
			const res = await fetch(BACKEND_API, {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			console.log(data.data);
			if (data.success) {
				const top3Safe: PredictionItem[] = Array.isArray(data.data.top3) ? data.data.top3 : [];
				setPredict({
					diagnosis: {
						disease: data.data.top_diagnosis ?? null,
						probability: data.data.confidence ? data.data.confidence.toFixed(2) : null,
					},
					top3: top3Safe.sort((a, b) => b.probability - a.probability),
				});
			}
		} catch (err) {
			console.error("SERVER ERROR:", err);
			alert("Server tidak merespon");
		}
	}

	useEffect(() => {
		console.log({ predict });
	}, [predict]);

	return (
		<div className="max-w-5xl mx-auto mt-8">
			<div>
				<h1 className="font-semibold text-xl text-center">Bayes Decision Theory</h1>
				<p className="font-medium text-md text-center">Deteksi Penyakit Kulit</p>
			</div>
			<div className="m-4 flex flex-col gap-4">
				<Label htmlFor="files">Upload Gambar</Label>
				<div className="relative overflow-hidden flex flex-col items-center justify-center w-full h-[32rem] border-2 border-gray-300 border-dashed rounded-md cursor-pointer dark:border-gray-600 group hover:bg-gray-50 dark:hover:bg-gray-800">
					{image ? (
						<img
							alt="image"
							src={URL.createObjectURL(image)}
							className="w-full h-full mx-auto object-cover"
						/>
					) : (
						<div className="flex flex-col items-center justify-center pt-5 pb-6">
							<UploadIcon className="w-10 h-10 mb-3 text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400" />
							<p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Drag and drop files here</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">or click to upload</p>
						</div>
					)}
					<Input
						id="files"
						type="file"
						className="absolute w-full h-full opacity-0 cursor-pointer bg-red-300"
						multiple
						accept="image/*"
						onChange={(event) => setImage(event.target.files?.[0] || null)}
					/>
				</div>
				<Button
					className="cursor-pointer"
					onClick={() => requestToServer()}
				>
					Prediksi
				</Button>
			</div>
			{predict.diagnosis.disease && (
				<div className="m-4 mt-8 rounded-xl border p-4 bg-white shadow">
					<h1 className="font-semibold text-lg mb-2">Diagnosis Utama</h1>
					<div className="flex justify-between py-2">
						<p className="text-xl font-bold text-red-600">{predict.diagnosis.disease}</p>
						<p className="text-sm font-semibold">{predict.diagnosis.probability}%</p>
					</div>
				</div>
			)}
			{predict.top3.length > 0 && (
				<div className="m-4 rounded-xl border p-4">
					<h2 className="font-semibold mb-2">Top 3 Kemungkinan</h2>
					{predict.top3.map((item, i) => (
						<div
							key={i}
							className="flex justify-between border-b py-2"
						>
							<span>
								{i + 1}. {item.disease}
							</span>
							<span className="font-semibold">{item.probability.toFixed(2)}%</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function UploadIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="17 8 12 3 7 8" />
			<line
				x1="12"
				x2="12"
				y1="3"
				y2="15"
			/>
		</svg>
	);
}
