import { get } from 'svelte/store';
import {
 setDrawingTool,
 setMagnetMode as setStoreMagnetMode,
 chartInstance,
 selectedOverlay,
 overlays,
 removeOverlay,
 selectOverlay,
 addOverlay
} from '../../stores/chartStore.js';
import { createOverlay, removeOverlay as removeChartOverlay } from '../../chart/chart.js';
import { DRAWING_TOOLS } from '../../utils/constants.js';
import { t, getCurrentLocale } from '../../utils/i18n.js';

export function selectDrawingTool(tool) {
 console.log('Selecting drawing tool:', tool);
 const chart = get(chartInstance);

 if (chart && tool) {
 try {
 const overlayId = chart.createOverlay({
 name: tool,
 mode: 'draw',
 lock: false,
 visible: true,
 zLevel: 0
 });

 console.log('Created overlay with ID:', overlayId);

 if (overlayId) {
 const overlayInfo = {
 id: overlayId,
 name: tool,
 type: tool,
 visible: true,
 locked: false,
 createdAt: Date.now()
 };

 addOverlay(overlayInfo);
 console.log('Added overlay to store:', overlayInfo);
 }

 setDrawingTool(tool);
 return overlayId;

 } catch (error) {
 console.error('Error creating overlay:', error);

 try {
 const overlayId = chart.createOverlay(tool);
 console.log('Created overlay (fallback method):', overlayId);

 if (overlayId) {
 addOverlay({
 id: overlayId,
 name: tool,
 type: tool,
 visible: true,
 locked: false,
 createdAt: Date.now()
 });
 }

 setDrawingTool(tool);
 return overlayId;

 } catch (fallbackError) {
 console.error('Fallback overlay creation failed:', fallbackError);
 setDrawingTool(null);
 return null;
 }
 }
 } else {
 setDrawingTool(null);
 return null;
 }
}

export function setMagnetMode(mode) {
 console.log('Setting magnet mode:', mode);
 const chart = get(chartInstance);

 if (chart) {
 chart.setStyles({
 overlay: {
 point: {
 activeBackgroundColor: mode === 'strong_magnet' ? '#ff0000' : mode === 'weak_magnet' ? '#ffaa00' : '#888888'
 }
 }
 });
 }

 setStoreMagnetMode(mode);
}

export function removeSelectedOverlay() {
 const overlay = get(selectedOverlay);
 const chart = get(chartInstance);

 if (overlay && chart) {
 console.log('Removing selected overlay:', overlay.id);
 try {
 chart.removeOverlay(overlay.id);
 removeOverlay(overlay.id);
 selectOverlay(null);
 console.log('Successfully removed selected overlay');
 } catch (error) {
 console.error('Error removing selected overlay:', error);
 }
 }
}

export function clearAllOverlays() {
 const chart = get(chartInstance);
 const allOverlays = get(overlays);

 if (chart) {
 console.log('Clearing all overlays. Store count:', allOverlays.length);

 try {
 allOverlays.forEach(overlay => {
 try {
 chart.removeOverlay(overlay.id);
 console.log(`Removed overlay ${overlay.id}`);
 } catch (e) {
 console.error(`Failed to remove overlay ${overlay.id}:`, e);
 }
 });

 const chartOverlays = [];
 for (let id = 1; id < 1000; id++) {
 const overlay = chart.getOverlayById(id);
 if (overlay) {
 chartOverlays.push(overlay);
 try {
 chart.removeOverlay(id);
 console.log('Removed chart overlay ID:', id);
 } catch (e) {
 console.error('Failed to remove chart overlay:', id, e);
 }
 }
 }

 console.log('Found and removed chart overlays:', chartOverlays.length);

 overlays.set([]);
 selectOverlay(null);
 setDrawingTool(null);

 if (chartOverlays.length === 0 && allOverlays.length === 0) {
 console.log('No overlays found, forcing chart refresh');
 chart.resize();
 }

 console.log('All overlays cleared successfully');

 } catch (error) {
 console.error('Error during overlay clearing:', error);
 }
 } else {
 console.error('Chart instance not available for clearing');
 }
}

export function clearAllOverlaysFromChart() {
 const chart = get(chartInstance);
 const allOverlays = get(overlays);

 if (chart) {
 console.log('Clearing overlays from chart. Store count:', allOverlays.length);

 try {
 allOverlays.forEach(overlay => {
 try {
 chart.removeOverlay(overlay.id);
 console.log(`Removed overlay ${overlay.id}`);
 } catch (e) {
 console.error(`Failed to remove overlay ${overlay.id}:`, e);
 }
 });

 for (let id = 1; id < 1000; id++) {
 const overlay = chart.getOverlayById(id);
 if (overlay) {
 try {
 chart.removeOverlay(id);
 console.log('Removed chart overlay ID:', id);
 } catch (e) {
 console.error('Failed to remove chart overlay:', id, e);
 }
 }
 }

 overlays.set([]);
 selectOverlay(null);
 setDrawingTool(null);

 console.log('Chart overlays cleared');

 } catch (error) {
 console.error('Error during chart overlay clearing:', error);
 }
 } else {
 console.error('Chart instance not available');
 }
}

export function getDrawingToolGroups() {
 const locale = getCurrentLocale();

 const tools = {
 single: [
 { key: 'straightLine', text: 'Trend Line' },
 { key: 'rayLine', text: 'Ray Line' },
 { key: 'segment', text: 'Line Segment' },
 { key: 'arrow', text: 'Arrow' },
 { key: 'horizontalStraightLine', text: 'Horizontal Line' },
 { key: 'verticalStraightLine', text: 'Vertical Line' },
 { key: 'priceLine', text: 'Price Line' }
 ],
 polygon: [
 { key: 'rect', text: 'Rectangle' },
 { key: 'circle', text: 'Circle' },
 { key: 'triangle', text: 'Triangle' },
 { key: 'parallelogram', text: 'Parallelogram' }
 ],
 fibonacci: [
 { key: 'fibonacciSegment', text: 'Fibonacci Retracement' },
 { key: 'fibonacciExtension', text: 'Fibonacci Extension' },
 { key: 'fibonacciCircle', text: 'Fibonacci Circle' },
 { key: 'fibonacciSpiral', text: 'Fibonacci Spiral' },
 { key: 'fibonacciSpeedResistanceFan', text: 'Fibonacci Fan' },
 { key: 'gannBox', text: 'Gann Box' }
 ],
 wave: [
 { key: 'threeWaves', text: '3 Waves (A-B-C)' },
 { key: 'fiveWaves', text: '5 Waves (Elliott)' },
 { key: 'eightWaves', text: '8 Waves (Full Cycle)' },
 { key: 'anyWaves', text: 'Custom Waves' },
 { key: 'abcd', text: 'ABCD Pattern' },
 { key: 'xabcd', text: 'XABCD Pattern' }
 ]
 };

 console.log('Available drawing tools:', tools);
 return tools;
}

export function toggleOverlayVisibility(overlayId) {
 const chart = get(chartInstance);

 if (chart) {
 console.log('Toggling overlay visibility:', overlayId);
 const overlay = chart.getOverlayById(overlayId);
 if (overlay) {
 chart.setOverlayStyles(overlayId, {
 visible: !overlay.visible
 });
 }
 }
}

export function lockOverlay(overlayId, locked = true) {
 const chart = get(chartInstance);

 if (chart) {
 console.log('Setting overlay lock:', overlayId, locked);
 chart.setOverlayStyles(overlayId, {
 lock: locked
 });
 }
}

export function duplicateOverlay(overlayId) {
 const chart = get(chartInstance);

 if (chart) {
 console.log('Duplicating overlay:', overlayId);
 const overlay = chart.getOverlayById(overlayId);
 if (overlay) {
 const newOverlayId = chart.createOverlay(overlay.name, overlay.points);
 if (newOverlayId) {
 addOverlay({
 id: newOverlayId,
 name: overlay.name,
 type: overlay.name,
 visible: true,
 locked: false,
 createdAt: Date.now()
 });
 }
 }
 }
}

export function getOverlayInfo(overlayId) {
 const chart = get(chartInstance);

 if (chart) {
 return chart.getOverlayById(overlayId);
 }
 return null;
}

export function trackOverlayCreation() {
 const chart = get(chartInstance);

 if (chart) {
 chart.subscribeAction('onDrawStart', (data) => {
 console.log('Draw started:', data);
 });

 chart.subscribeAction('onDrawEnd', (data) => {
 console.log('Draw ended:', data);
 if (data && data.overlay) {
 const overlayInfo = {
 id: data.overlay.id || Date.now(),
 name: data.overlay.name,
 type: data.overlay.name,
 visible: true,
 locked: false,
 createdAt: Date.now()
 };

 addOverlay(overlayInfo);
 console.log('Tracked new overlay:', overlayInfo);
 }
 });
 }
}

export function initializeDrawingTracking() {
 const chart = get(chartInstance);

 if (chart) {
 console.log('Initializing drawing tracking...');
 trackOverlayCreation();

 const existingOverlays = [];
 for (let id = 1; id < 100; id++) {
 const overlay = chart.getOverlayById(id);
 if (overlay) {
 existingOverlays.push({
 id: overlay.id || id,
 name: overlay.name || 'unknown',
 type: overlay.name || 'unknown',
 visible: true,
 locked: false,
 createdAt: Date.now()
 });
 }
 }

 if (existingOverlays.length > 0) {
 console.log('Found existing overlays:', existingOverlays);
 overlays.set(existingOverlays);
 }
 }
}