import { useStore } from '../utils/store';
import { IconButton } from '@mui/material';
import { Close, DeleteSweep } from '@mui/icons-material';

interface LogWindowProps {
    onClose: () => void;
}

export default function LogWindow({ onClose }: LogWindowProps) {
    const { logs, clearLogs } = useStore();

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            case 'success': return 'text-green-500';
            default: return 'text-blue-400';
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="absolute top-12 right-0 w-96 max-h-[80vh] bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col z-50">
            <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800 rounded-t-lg">
                <h3 className="text-white font-semibold ml-2 text-sm">Логи</h3>
                <div className="flex gap-1">
                    <IconButton size="small" onClick={clearLogs} title="Очистить">
                        <DeleteSweep className="text-gray-400 hover:text-white" fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onClose} title="Закрыть">
                        <Close className="text-gray-400 hover:text-white" fontSize="small" />
                    </IconButton>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[200px]">
                {logs.length === 0 ? (
                    <div className="text-gray-500 text-center py-4 text-xs">Нет записей</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="text-xs font-mono p-1 hover:bg-gray-800 rounded border-b border-gray-800 last:border-0">
                            <div className="flex gap-2 text-gray-500 mb-0.5">
                                <span>[{formatTime(log.timestamp)}]</span>
                                {log.source && <span className="text-gray-400">{log.source}</span>}
                            </div>
                            <div className={`${getLevelColor(log.level)} break-words`}>
                                {log.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

