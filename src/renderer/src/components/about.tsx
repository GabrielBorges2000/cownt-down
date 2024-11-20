import { NavLink } from "react-router-dom";
import { Separator } from "./ui/separator";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Mail, Phone } from "lucide-react";

export function About() {
	return (
		<div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-8">
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Sobre</h1>
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
			</header>
			<Separator className="my-8 bg-zinc-700" />
			<main className="flex-1 flex flex-col">
				<p className="text-zinc-400 mt-4">
					O Countdown é um aplicativo projetado para ajudar você a organizar seu
					tempo de forma eficiente. Com ele, é possível criar, personalizar e
					gerenciar contagens regressivas de maneira prática, seja para eventos
					importantes, metas pessoais ou prazos profissionais. Facilite sua
					rotina e nunca perca o controle dos seus momentos mais importantes!
				</p>
				<Separator className="my-8 bg-zinc-700" />

				<Card className="bg-zinc-950 border-zinc-700">
					<CardHeader>
						<CardTitle className="text-zinc-200">Suport</CardTitle>
						<CardDescription className="text-zinc-400">
							Precisa de ajuda? Entre em contato conosco através dos seguintes
							canais.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex flex-row items-center gap-2 text-zinc-400">
								<Mail aria-label="Email" />
								gabriel.vscode@gmail.com
							</div>
							<div className="flex flex-row items-center gap-2 text-zinc-400">
								<Phone />
								(11) 98623-7504
							</div>
						</div>
					</CardContent>
				</Card>
			</main>
			<footer className="bg-zinc-950 border-t border-neutral-200 text-white mt-8">
				<div className="max-w-7xl mx-auto ">
					<div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="col-span-1 md:col-span-2">
							<h3 className="text-3xl font-bold tracking-tighter">
								Codeborges
							</h3>
							<p className="mt-4 text-sm text-gray-400">
								Compartilhando conhecimento e experiências no mundo do
								desenvolvimento.
							</p>
						</div>
						<div>
							<h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
							<ul className="space-y-2">
								<li>
									<NavLink to="/">Inicio</NavLink>
								</li>
								<li>
									<NavLink to="/about">Sobre</NavLink>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="text-lg font-semibold mb-4">Redes Sociais</h4>
							<ul className="space-y-2">
								<li>
									<a
										href="https://github.com/GabrielBorges2000"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-gray-300 transition-colors"
									>
										GitHub
									</a>
								</li>
								<li>
									<a
										href="https://linkedin.com/in/GabrielBorges2000"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-gray-300 transition-colors"
									>
										LinkedIn
									</a>
								</li>
								<li>
									<a
										href="https://portfolio.codeborges.com.br/"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-gray-300 transition-colors"
									>
										Portfólio
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-gray-800 py-6 text-sm text-center text-gray-400">
						© {new Date().getFullYear()} Codeborges. Todos os direitos
						reservados.
					</div>
				</div>
			</footer>
		</div>
	);
}
