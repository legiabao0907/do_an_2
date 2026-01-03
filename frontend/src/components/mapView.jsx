import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Pane } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaClock, FaChevronLeft, FaChevronRight, FaColumns, FaLayerGroup } from 'react-icons/fa';
import './TimeLapseToolbar.css';

// --- CẤU HÌNH ---
const HIGH_RES_BOUNDS = [
    [20.985, 105.780],
    [21.050, 105.880]
];

// --- COMPONENT: LAYER MANAGER ---
// Đã thêm prop `pane` để hỗ trợ Swipe Mode (render layer vào pane riêng)
const HistoricalLayerManager = ({ year, pane = 'tilePane' }) => {
    const map = useMap();
    const layersRef = useRef([]);

    useEffect(() => {
        // Cleanup cũ
        layersRef.current.forEach(layer => {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });
        layersRef.current = [];

        // Layer Low Res
        const layerLow = L.tileLayer(`http://localhost:3000/tiles/${year}/low/{z}/{x}/{y}.jpeg`, {
            minZoom: 0, maxZoom: 14, opacity: 1, tms: false,
            attribution: `Data ${year}`,
            pane: pane // Quan trọng: set pane cho layer
        });

        // Layer High Res
        const layerHigh = L.tileLayer(`http://localhost:3000/tiles/${year}/high/{z}/{x}/{y}.jpeg`, {
            minZoom: 15, maxZoom: 22, opacity: 1, tms: false,
            // bounds: HIGH_RES_BOUNDS,
            pane: pane // Quan trọng: set pane cho layer
        });

        layerLow.addTo(map);
        layerHigh.addTo(map);

        layersRef.current = [layerLow, layerHigh];

        return () => {
            layersRef.current.forEach(layer => {
                if (map.hasLayer(layer)) map.removeLayer(layer);
            });
        };
    }, [year, map, pane]);

    return null;
};

// --- COMPONENT: TOOLBAR (Giữ nguyên) ---
const TimeLapseToolbar = ({ years, activeYear, onYearChange, isSwipeMode, onToggleMode }) => {
    const currentIndex = years.indexOf(activeYear);
    const maxIndex = years.length - 1;

    const handleSliderChange = (e) => {
        const index = parseInt(e.target.value);
        onYearChange(years[index]);
    };

    const handlePrev = () => {
        if (currentIndex > 0) onYearChange(years[currentIndex - 1]);
    };

    const handleNext = () => {
        if (currentIndex < maxIndex) onYearChange(years[currentIndex + 1]);
    };

    return (
        <div className="google-earth-toolbar">
            {/* Controls Trái */}
            <div className="left-controls">
                <button
                    className={`nav-btn ${isSwipeMode ? 'active-mode' : ''}`}
                    onClick={onToggleMode}
                    title={isSwipeMode ? "Switch to Time-Lapse" : "Switch to Swipe Mode"}
                    style={{ marginRight: '15px', color: isSwipeMode ? '#4cc9f0' : 'white' }}
                >
                    {isSwipeMode ? <FaColumns size={16} /> : <FaLayerGroup size={16} />}
                    <span style={{ marginLeft: 6, fontSize: '0.8rem' }}>
                        {isSwipeMode ? "Swipe" : "Time"}
                    </span>
                </button>

                <div className="icon-wrapper"><FaClock size={16} /></div>
                <div className="date-display">
                    <span className="date-label">{isSwipeMode ? "Trái:" : "Dữ liệu:"}</span>
                    <span className="date-value">{activeYear}</span>
                </div>
                <button className="nav-btn" onClick={handlePrev} disabled={currentIndex === 0}>
                    <FaChevronLeft />
                </button>
                <button className="nav-btn" onClick={handleNext} disabled={currentIndex === maxIndex}>
                    <FaChevronRight />
                </button>
            </div>

            {/* Slider Phải */}
            <div className="timeline-container">
                <div className="timeline-ticks">
                    {years.map((y, index) => {
                        const positionLeft = maxIndex === 0 ? 0 : (index / maxIndex) * 100;
                        return (
                            <div
                                key={y}
                                className="tick-item"
                                style={{ left: `${positionLeft}%` }}
                            >
                                <span className="tick-mark"></span>
                                <span className="tick-label">{y}</span>
                            </div>
                        );
                    })}
                </div>

                <input
                    type="range"
                    min="0"
                    max={maxIndex}
                    step="1"
                    value={currentIndex}
                    onChange={handleSliderChange}
                    className="google-slider"
                />
            </div>
        </div>
    );
};

// --- COMPONENT: SELECTOR PHẢI ---
const RightYearSelector = ({ years, activeYear, onYearChange }) => {
    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            padding: '10px 15px',
            borderRadius: '8px',
            color: 'white',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>Bên Phải</div>
            <select
                value={activeYear}
                onChange={(e) => onYearChange(e.target.value)}
                style={{
                    background: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
};

// --- COMPONENT: THANH TRƯỢT KÉO THẢ THỦ CÔNG ---
const ManualSwipeControl = ({ position, onChange }) => {
    const isDragging = useRef(false);
    const containerRef = useRef(null);

    // Xử lý kéo thả slider
    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging.current) return;
            // Tính toán % dựa trên chiều rộng màn hình
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX === undefined) return;

            const width = window.innerWidth;
            let newPos = clientX / width;
            if (newPos < 0) newPos = 0;
            if (newPos > 1) newPos = 1;

            onChange(newPos);
        };

        const handleUp = () => {
            isDragging.current = false;
            document.body.style.userSelect = '';
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [onChange]);

    const handleDown = () => {
        isDragging.current = true;
        document.body.style.userSelect = 'none'; // Chặn bôi đen text khi kéo
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: 0, bottom: 0,
                left: `${position * 100}%`,
                width: '6px', // Dày hơn
                background: '#4cc9f0', // Màu xanh cyan cho dễ nhìn
                zIndex: 10000,
                cursor: 'ew-resize',
                boxShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 0 1px white' // Đổ bóng đậm + viền trắng
            }}
            onMouseDown={handleDown}
            onTouchStart={handleDown}
        >
            {/* Nút tròn ở giữa để dễ kéo */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40px', height: '40px', // Lớn hơn
                background: '#4cc9f0', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                color: 'white',
                border: '2px solid white'
            }}>
                <FaColumns size={20} />
            </div>
        </div>
    );
};

// --- COMPONENT: XỬ LÝ CẮT LAYER (CLIP) ---
// Component này lắng nghe thay đổi của slider và cập nhật CSS clip-path cho pane bên phải
const SwipeClipHandler = ({ position, rightPaneName }) => {
    const map = useMap();

    useEffect(() => {
        const updateClip = () => {
            const pane = map.getPane(rightPaneName);
            if (!pane) return;

            const mapSize = map.getSize();
            // L.DomUtil.getPosition trả về vị trí offset hiện tại của Pane (do map pan)
            const offset = L.DomUtil.getPosition(pane) || { x: 0, y: 0 };

            // Tính toán tọa độ X trên màn hình (đường chia cắt)
            const screenX = mapSize.x * position;

            // Chuyển đổi sang tọa độ cục bộ của Pane
            const localX = screenX - offset.x;
            const localY = -offset.y;

            // Tạo polygon bao quanh phần BÊN PHẢI (từ đường cắt -> hết phải)
            // Cần bao phủ đủ rộng, dùng mapSize * 2 hoặc số lớn
            const rightBound = (mapSize.x * 2) - offset.x;
            const bottomBound = (mapSize.y * 2) - offset.y;

            // Các điểm Polygon: Top-Left -> Top-Right -> Bottom-Right -> Bottom-Left
            // TL: (localX, localY)
            // TR: (rightBound, localY)
            // BR: (rightBound, bottomBound)
            // BL: (localX, bottomBound)

            pane.style.clipPath = `polygon(${localX}px ${localY}px, ${rightBound}px ${localY}px, ${rightBound}px ${bottomBound}px, ${localX}px ${bottomBound}px)`;
        };

        // Cập nhật lần đầu
        updateClip();

        // Cập nhật khi map di chuyển (pan/zoom) hoặc resize
        map.on('move', updateClip);
        map.on('resize', updateClip);
        map.on('zoom', updateClip); // move thường bao gồm zoom, nhưng thêm vào cho chắc

        return () => {
            map.off('move', updateClip);
            map.off('resize', updateClip);
            map.off('zoom', updateClip);

            const pane = map.getPane(rightPaneName);
            if (pane) pane.style.clipPath = '';
        };
    }, [position, map, rightPaneName]);

    return null;
};

// --- COMPONENT CHÍNH ---
export default function MapView() {
    const YEARS = ['2017', '2023', '2025'];
    const [year, setYear] = useState(YEARS[0]); // Year bên trái (hoặc chính)
    const [compareYear, setCompareYear] = useState(YEARS[1]); // Year bên phải
    const [isSwipeMode, setIsSwipeMode] = useState(false);

    // Vị trí thanh swipe (0.0 -> 1.0)
    const [swipePosition, setSwipePosition] = useState(0.5);

    const center = [21.0285, 105.8544];

    const toggleMode = () => {
        setIsSwipeMode(prev => !prev);
    };

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative', backgroundColor: '#000' }}>
            {/* Toolbar Chính (Control Trái / Time) */}
            <TimeLapseToolbar
                years={YEARS}
                activeYear={year}
                onYearChange={setYear}
                isSwipeMode={isSwipeMode}
                onToggleMode={toggleMode}
            />

            {/* Selector Phụ (Chỉ hiện khi Swipe Mode) */}
            {isSwipeMode && (
                <>
                    <RightYearSelector
                        years={YEARS}
                        activeYear={compareYear}
                        onYearChange={setCompareYear}
                    />
                    <ManualSwipeControl
                        position={swipePosition}
                        onChange={setSwipePosition}
                    />
                </>
            )}

            <MapContainer
                center={center}
                zoom={12}
                minZoom={4}
                maxZoom={20}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri"
                />

                {/* Tạo Pane riêng cho Layer phải, zIndex cao hơn mặc định (400) để đè lên layer trái */}
                <Pane name="right-layer-pane" style={{ zIndex: 450 }} />

                {/* Layer Trái (Mặc định ở tilePane) */}
                <HistoricalLayerManager year={year} />

                {/* Layer Phải (Chỉ hiện khi Swipe Mode) */}
                {isSwipeMode && (
                    <>
                        <HistoricalLayerManager year={compareYear} pane="right-layer-pane" />
                        <SwipeClipHandler position={swipePosition} rightPaneName="right-layer-pane" />
                    </>
                )}
            </MapContainer>
        </div>
    );
}