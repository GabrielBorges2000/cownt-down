import { useState, useEffect } from "react";
import { Button } from "@renderer/components/ui/button";
import { Input } from "@renderer/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@renderer/components/ui/select";
import { Minus, Plus, Monitor, Play, Square } from "lucide-react";

declare global {
	interface Window {
		electron: {
			openSecondaryWindow: () => void;
			sendTimeUpdate: (time: number, isOvertime: boolean) => void;
		};
	}
}

export function Countdown() {
	const [timeLeft, setTimeLeft] = useState(0);
	const [inputTime, setInputTime] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState("");
	const [isOvertime, setIsOvertime] = useState(false);
	const [continueAfterZero, setContinueAfterZero] = useState(false);
	const [isExpireTime, setIsExpireTime] = useState(false);

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isRunning) {
			interval = setInterval(() => {
				setTimeLeft((time) => {
					let newTime = time;
					if (time > 0 && !isExpireTime) {
						newTime = time - 1;
						if (newTime <= 0) {
							setIsExpireTime(true);
						}
					} else if (continueAfterZero) {
						newTime = Math.abs(time) + 1;
						setIsOvertime(true);
					} else {
						setIsRunning(false);
					}
					window.api.sendTimeUpdate(newTime, newTime < 0);
					return newTime;
				});
			}, 1000);
		}

		return () => clearInterval(interval);
	}, [isRunning, continueAfterZero, isExpireTime]);

	const handleStartStop = () => {
		if (isRunning) {
			setIsRunning(false);
		} else {
			if (timeLeft <= 0 && !continueAfterZero) {
				setError("O tempo deve ser maior que zero.");
				return;
			}
			setError("");
			setIsRunning(true);
			setIsOvertime(false);
		}
	};

	const handleReset = () => {
		setIsRunning(false);
		setTimeLeft(0);
		setInputTime("");
		setError("");
		setIsOvertime(false);
		setIsExpireTime(false);
		window.api.sendTimeUpdate(0, false);
	};

	const handleTimeChange = (value: string) => {
		setInputTime(value);
		const seconds = Number.parseInt(value) * 60;
		if (!Number.isNaN(seconds) && seconds >= 0) {
			setTimeLeft(seconds);
			setError("");
		} else {
			setError("Por favor, insira um número válido de minutos.");
		}
	};

	const adjustTime = (amount: number) => {
		setTimeLeft((time) => Math.max(0, time + amount * 60));
		setInputTime(String(Math.max(0, Math.floor(timeLeft / 60) + amount)));
	};

	const openInSecondScreen = () => {
		window.api.openSecondaryWindow();
	};

	const formatTime = (seconds: number) => {
		const absSeconds = Math.abs(seconds);
		const mins = Math.floor(absSeconds / 60);
		const secs = absSeconds % 60;
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

	return (
		<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="space-y-2 text-center">
					<div className="inline-flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 bg-zinc-950 hover:bg-zinc-900"
							onClick={() => adjustTime(-1)}
							disabled={isRunning}
						>
							<Minus className="h-4 w-4" color="#fff" />
						</Button>
						<Input
							type="number"
							value={inputTime}
							onChange={(e) => handleTimeChange(e.target.value)}
							className="w-20 bg-zinc-900 border-zinc-800 text-center"
							placeholder="Min"
							disabled={isRunning}
						/>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 bg-zinc-950 hover:bg-zinc-900"
							onClick={() => adjustTime(1)}
							disabled={isRunning}
						>
							<Plus className="h-4 w-4" color="#fff" />
						</Button>
						<Select
							onValueChange={(value) => setContinueAfterZero(value === "true")}
							defaultValue={continueAfterZero ? "true" : "false"}
						>
							<SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
								<SelectValue placeholder="Modo de contagem" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="false">Parar em zero</SelectItem>
								<SelectItem value="true">Continuar após zero</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div
					className={`relative aspect-[2/1] bg-zinc-900 rounded-xl flex items-center justify-center text-8xl font-mono ${isOvertime ? "text-red-500" : ""}`}
				>
					{isOvertime ? "+" : ""}
					{formatTime(timeLeft)}
				</div>

				{error && <p className="text-red-500 text-center text-sm">{error}</p>}

				<div className="flex gap-4">
					<Button
						className={`flex-1 ${isRunning ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
						size="lg"
						onClick={handleStartStop}
					>
						{isRunning ? (
							<Square className="w-4 h-4 mr-2" />
						) : (
							<Play className="w-4 h-4 mr-2" />
						)}
						{isRunning ? "Parar" : "Começar"}
					</Button>
					<Button
						variant="outline"
						size="lg"
						onClick={handleReset}
						className="bg-zinc-900 border-zinc-800"
						disabled={isRunning}
					>
						Resetar
					</Button>
					<Button
						variant="outline"
						size="lg"
						onClick={openInSecondScreen}
						className="bg-zinc-900 border-zinc-800"
					>
						<Monitor className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
