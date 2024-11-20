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
import { NavLink } from "react-router-dom";

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
	const [inputTime, setInputTime] = useState("0");
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState("");
	const [isOvertime, setIsOvertime] = useState(false);
	const [continueAfterZero, setContinueAfterZero] = useState(false);
	const [isExpireTime, setIsExpireTime] = useState(false);
	const [isNoExternalDisplay, setIsNoExternalDisplay] = useState(false);

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
							setIsOvertime(true);
						}
					} else if (continueAfterZero) {
						newTime = Math.abs(time) + 1;
						setIsOvertime(true);
					} else {
						setIsRunning(false);
						window.api.sendTimeUpdate(0, false);
					}
					if (isExpireTime) {
						window.api.sendTimeUpdate(newTime, true);
					} else {
						window.api.sendTimeUpdate(newTime, newTime <= 0);
					}

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
			if (timeLeft <= 0) {
				setError("O tempo deve ser maior que zero.");
				return;
			}
			setError("");
			setIsRunning(true);
			setIsOvertime(false);
			setIsExpireTime(false);
			window.api.sendTimeUpdate(0, false);
		}
	};

	const handleReset = () => {
		setIsRunning(false);
		setTimeLeft(0);
		setInputTime("0");
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

	const openOrCloseInSecondScreen = () => {
		if (isNoExternalDisplay) {
			window.api.closeSecondaryWindow();
		} else {
			window.api.openSecondaryWindow();
		}

		setIsNoExternalDisplay(!isNoExternalDisplay);

		console.log("isNoExternalDisplay", isNoExternalDisplay);
	};

	const formatTime = (seconds: number) => {
		const absSeconds = Math.abs(seconds);
		const mins = Math.floor(absSeconds / 60);
		const secs = absSeconds % 60;
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	};

	return (
		<div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-8">
			<header className="flex items-center justify-end">
				<nav className="flex gap-4">
					<nav className="flex gap-4">
						<NavLink
							to="/"
							className={({ isActive }) =>
								isActive ? "text-emerald-400 font-bold" : "hover:text-gray-500"
							}
						>
							Inicio
						</NavLink>
						<NavLink
							to="/about"
							className={({ isActive }) =>
								isActive ? "text-emerald-400 font-bold" : "hover:text-gray-500"
							}
						>
							Sobre
						</NavLink>
					</nav>
				</nav>
			</header>
			<div className="w-full max-w-md space-y-4 m-auto">
				<div className="space-y-2 text-center">
					<div className="inline-flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
							onClick={() => adjustTime(-1)}
							disabled={isExpireTime}
						>
							<Minus className="h-4 w-4 text-withe hover:text-black" />
						</Button>
						<Input
							type="number"
							value={inputTime}
							onChange={(e) => handleTimeChange(e.target.value)}
							className="w-20 bg-zinc-900 border-zinc-800 text-center placeholder:text-zinc-500"
							placeholder="Min"
							disabled={isRunning || isExpireTime}
							style={{
								appearance: "none",
								MozAppearance: "textfield",
								WebkitAppearance: "none",
							}}
						/>

						<Button
							variant="outline"
							size="icon"
							className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
							onClick={() => adjustTime(1)}
							disabled={isExpireTime}
						>
							<Plus className="h-4 w-4 text-withe hover:text-black" />
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
						onClick={openOrCloseInSecondScreen}
						className="bg-zinc-900 border-zinc-800"
					>
						<Monitor className="w-4 h-4" />
					</Button>
				</div>

				<div className="flex gap-4">
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(+5)}
						disabled={isExpireTime}
					>
						<Plus className="h-4 w-4 hover text-withe hover:text-black" /> 5 min
					</Button>
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(+10)}
						disabled={isExpireTime}
					>
						<Plus className="h-4 w-4 hover text-withe hover:text-black" /> 10
						min
					</Button>
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(+20)}
						disabled={isExpireTime}
					>
						<Plus className="h-4 w-4 hover text-withe hover:text-black" /> 20
						min
					</Button>
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(+30)}
						disabled={isExpireTime}
					>
						<Plus className="h-4 w-4 hover text-withe hover:text-black" /> 30
						min
					</Button>
				</div>

				<div className="flex gap-4">
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(-5)}
						disabled={isExpireTime}
					>
						<Minus className="h-4 w-4 text-withe hover:text-black" /> 5 min
					</Button>
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(-10)}
						disabled={isExpireTime}
					>
						<Minus className="h-4 w-4 text-withe hover:text-black" /> 10 min
					</Button>
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(-20)}
						disabled={isExpireTime}
					>
						<Minus className="h-4 w-4 text-withe hover:text-black" /> 20 min
					</Button>
					<Button
						variant="outline"
						// size="icon"
						className="h-8  bg-zinc-950 hover:bg-zinc-50 hover:text-black"
						onClick={() => adjustTime(-30)}
						disabled={isExpireTime}
					>
						<Minus className="h-4 w-4 text-withe hover:text-black" /> 30 min
					</Button>
				</div>
			</div>
		</div>
	);
}
