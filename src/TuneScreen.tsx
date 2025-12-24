import React, {Fragment, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {get_drone_data, set_drone_data} from "./utils/drone_api.ts";
import {toast} from "react-toastify";


interface LpeFuses {
    GPS: boolean,
    OpticalFlow: boolean,
    VisionPosition: boolean,
    LandingTarget: boolean,
    LandDetector: boolean,
    PubAglAsLposDown: boolean,
    FlowGyroCompensation: boolean,
    Baro: boolean
}

interface Coefficients {
    MC_ROLLRATE_P: number
    MC_ROLLRATE_I: number
    MC_ROLLRATE_D: number
    MC_PITCHRATE_P: number
    MC_PITCHRATE_I: number
    MC_PITCHRATE_D: number
    MPC_XY_VEL_P: number
    MPC_Z_VEL_P: number
    MPC_THR_HOVER: number
}

interface TuningData {
    lpe_fusion: LpeFuses,
    coefficients: Coefficients
}

export default function TuneScreen() {
    const location = useLocation() as any;
    const navigate = useNavigate();
    const [_startData, setStartData] = useState<TuningData | null>(null);
    const [modifiedData, setModifiedData] = useState<TuningData | null>(null);
    const [loadingSave, setLoading] = useState<boolean>(false);

    useEffect(() => {
        get_drone_data(location.state.addr, "tune_params").then(data => {
            setStartData(data as TuningData);
            setModifiedData(data as TuningData);
            console.log(data);
        }).catch((e) => {
            console.error(e);
            toast.error("Не удалось получить параметры");
        });
    }, [location.state]);

    const applyParams = async () => {
        if (modifiedData === null) return;
        try {
            setLoading(true);
            const response = await set_drone_data(location.state.addr, "tune_params", modifiedData);
            if ((response as any).result) {
                toast.success("Настройки успешно применены");
            } else {
                toast.error("Ошибка при применении настроек");
            }
            setLoading(false);
        } catch (e) {
            console.error(e);
            toast.error("Ошибка при отправке параметров");
        }
    };

    const handleChangeLPE = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as keyof LpeFuses;
        const checked = event.target.checked;
        setModifiedData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                lpe_fusion: {
                    ...prev.lpe_fusion,
                    [name]: checked
                }
            } as TuningData;
        });
    };

    const setCoeffValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as keyof Coefficients;
        const value = Number(event.target.value);
        setModifiedData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                coefficients: {
                    ...prev.coefficients,
                    [name]: value
                }
            } as TuningData;
        });
    };

    return (
        <Fragment>
            <div className="flex flex-col h-screen bg-gray-50">
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                        {/* Header card, в стиле ListScreen */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded hover:bg-gray-100"
                                aria-label="back"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="flex-1">
                                <h1 className="text-lg font-semibold">Настройка дрона "{location.state?.name}"</h1>
                                <p className="text-sm text-gray-500">Настройка коэффициентов полёта и LPE fusion</p>
                            </div>

                            <div>
                                <button disabled={loadingSave} onClick={applyParams} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300">Сохранить</button>
                            </div>
                        </div>

                        {/* Content: карточки с параметрами (оставлены как есть, уже в стиле карточек) */}
                        {modifiedData ? (
                            <div>
                                {/* P coefficient */}
                                <div className="bg-white rounded shadow p-4 mb-4">
                                    <h2 className="text-lg font-semibold mb-2">P coefficient</h2>
                                    <p className="text-sm text-gray-600 mb-2">Коэффициент P (пропорциональный) используется для минимизации ошибки отслеживания и отвечает за скорость отклика, по этому должен быть установлен как можно выше, но без осцилляций.</p>
                                    <p className="text-xs text-gray-500 mb-3">- Если P слишком большой: вы увидите высокочастотные осцилляции.</p>
                                    <p className="text-xs text-gray-500 mb-3">- Если P слишком маленький: Аппарат медленно реагирует на входящее управление, а в режиме ACRO аппарат будет постоянно дрейфовать и вам нужно будет его корректировать, чтобы сохранить его уровень.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ROLLRATE</label>
                                            <input
                                                type="number"
                                                name="MC_ROLLRATE_P"
                                                value={modifiedData.coefficients.MC_ROLLRATE_P}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">PITCHRATE</label>
                                            <input
                                                type="number"
                                                name="MC_PITCHRATE_P"
                                                value={modifiedData.coefficients.MC_PITCHRATE_P}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* D coefficient */}
                                <div className="bg-white rounded shadow p-4 mb-4">
                                    <h2 className="text-lg font-semibold mb-2">D coefficient</h2>
                                    <p className="text-sm text-gray-600 mb-2">Коэффициент D (дифференциальный) используется для демпфирования. Этот коэффициент должен быть как можно выше, но таким образом, что бы не было "перестрелов" по управлению.</p>
                                    <p className="text-xs text-gray-500 mb-3">- Если D слишком большой: моторы могут подергиваться и сильно нагреваться во время полета, поскольку коэффициент D увеличивает шумы управления.</p>
                                    <p className="text-xs text-gray-500 mb-3">- Если D слишком маленький: возникнут "перестрелы" по входящему управляющему сигналу.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ROLLRATE</label>
                                            <input
                                                type="number"
                                                name="MC_ROLLRATE_D"
                                                value={modifiedData.coefficients.MC_ROLLRATE_D}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">PITCHRATE</label>
                                            <input
                                                type="number"
                                                name="MC_PITCHRATE_D"
                                                value={modifiedData.coefficients.MC_PITCHRATE_D}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* I coefficient */}
                                <div className="bg-white rounded shadow p-4 mb-4">
                                    <h2 className="text-lg font-semibold mb-2">I coefficient</h2>
                                    <p className="text-sm text-gray-600 mb-2">Коэффициент I сохраняет "воспоминания" об ошибке. Это значит, что элемент I увеличивается в случае, если желаемая скорость не устанавливается в течении некоторого времени. Этот параметр важен для режима ACRO, а также оказывает достаточно сильное влияние на режимы POSITION и OFFBOARD.</p>
                                    <p className="text-xs text-gray-500 mb-3">- Если I слишком большой: вы можете увидеть медленные осцилляции</p>
                                    <p className="text-xs text-gray-500 mb-3">- Если I слишком маленький: можно заметить ошибку по выполнению управляющего воздействия. Также заниженный коэффициент I заметен на логах, это характеризуется тем, что на графиках желаемая скорость длительное время отличается от фактической.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ROLLRATE</label>
                                            <input
                                                type="number"
                                                name="MC_ROLLRATE_I"
                                                value={modifiedData.coefficients.MC_ROLLRATE_I}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">PITCHRATE</label>
                                            <input
                                                type="number"
                                                name="MC_PITCHRATE_I"
                                                value={modifiedData.coefficients.MC_PITCHRATE_I}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Holding position */}
                                <div className="bg-white rounded shadow p-4 mb-4">
                                    <h2 className="text-lg font-semibold mb-2">Holding position</h2>
                                    <p className="text-sm text-gray-600 mb-2">Если коптер нестабильно удерживает позицию в POSCTL и OFFBOARD, попробуйте изменить эти коэффициенты</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">XY_VEL_P</label>
                                            <input
                                                type="number"
                                                name="MPC_XY_VEL_P"
                                                value={modifiedData.coefficients.MPC_XY_VEL_P}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Z_VEL_P</label>
                                            <input
                                                type="number"
                                                name="MPC_Z_VEL_P"
                                                value={modifiedData.coefficients.MPC_Z_VEL_P}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">THR_HOVER</label>
                                            <input
                                                type="number"
                                                name="MPC_THR_HOVER"
                                                value={modifiedData.coefficients.MPC_THR_HOVER}
                                                onChange={setCoeffValue}
                                                step={0.001}
                                                min={0.001}
                                                max={1}
                                                className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* LPE Fusion */}
                                <div className="bg-white rounded shadow p-4 mb-4">
                                    <h2 className="text-lg font-semibold mb-2">LPE Fusion</h2>
                                    <p className="text-sm text-gray-600 mb-2">Параметры по которым полетный контроллер рассчитывает локальную позицию</p>
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {Object.entries(modifiedData.lpe_fusion).map(([key, val]) => (
                                            <label key={key} className="inline-flex items-center gap-2 border border-gray-200 rounded px-3 py-2 bg-gray-50">
                                                <input type="checkbox" name={key} checked={val as boolean} onChange={handleChangeLPE} className="w-4 h-4" />
                                                <span className="text-sm text-gray-700">{key}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[80vh]">
                                <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                <p className="mt-2 text-gray-600">Retrieving parameters...</p>
                            </div>
                        )}

                        <div className="h-16" />
                    </div>
                </div>
            </div>
        </Fragment>
    );
}