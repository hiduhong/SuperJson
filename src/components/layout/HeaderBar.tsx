import { Code2, Github, Settings } from "lucide-react";
import { Button } from "../ui/Button";

interface HeaderBarProps {
    onLoadDirtySample?: () => void;
}

export const HeaderBar = ({ onLoadDirtySample }: HeaderBarProps) => {
    return (
        <div className="flex items-center justify-between px-6 h-full w-full">
            <div className="flex items-center space-x-3">
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                    <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          SuperJson
        </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          v0.1.0-MVP
        </span>
            </div>
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={onLoadDirtySample} title="Load Dirty Log Sample">
                    Dirty Sample
                </Button>
                <Button variant="ghost" size="sm">
                    <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                    <Settings className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};
