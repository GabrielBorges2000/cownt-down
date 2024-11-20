import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Countdown } from "./components/primary-count-down";
import { SecondaryWindow } from "./components/secondary-count-down";

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Countdown />} />
				<Route path="/secondary" element={<SecondaryWindow />} />
			</Routes>
		</Router>
	);
}
