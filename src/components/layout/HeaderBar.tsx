import { Github, Settings } from "lucide-react";
import { Button } from "../ui/Button";

const BrandMark = () => {
  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-sky-500/15 p-2">
      <span className="relative block h-5 w-5 text-emerald-600">
        <span className="absolute inset-y-0 left-0 text-sm font-semibold leading-5">{'{'}</span>
        <span className="absolute inset-y-0 right-0 text-sm font-semibold leading-5">{'}'}</span>
        <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600" />
      </span>
    </div>
  );
};

export const HeaderBar = () => {
    return (
        <div className="flex items-center justify-between px-6 h-full w-full">
            <div className="flex items-center space-x-3">
                <BrandMark />
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600">
          SuperJson
        </span>
            </div>
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open("https://github.com/hiduhong/SuperJson", "_blank", "noopener,noreferrer")}
                    aria-label="GitHub"
                    title="GitHub"
                >
                    <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                    <Settings className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};
