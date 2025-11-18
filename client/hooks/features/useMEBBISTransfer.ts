import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
 MEBBISTransferState, 
 StartTransferRequest, 
 SessionCompletedEvent, 
 MEBBISTransferError 
} from '@shared/types/mebbis-transfer.types';
import { toast } from 'sonner';

const SOCKET_URL = window.location.origin;

export function useMEBBISTransfer() {
 const [transferState, setTransferState] = useState<MEBBISTransferState>({
 transferId: null,
 status: 'idle',
 progress: { total: 0, completed: 0, failed: 0, current: 0 },
 errors: []
 });

 const socketRef = useRef<Socket | null>(null);

 useEffect(() => {
 return () => {
 if (socketRef.current) {
 socketRef.current.disconnect();
 }
 };
 }, []);

 const startTransfer = useCallback(async (request: StartTransferRequest) => {
 try {
 setTransferState(prev => ({ ...prev, status: 'connecting' }));

 const response = await fetch('/api/mebbis/start-transfer', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(request),
 credentials: 'include'
 });

 const data = await response.json();

 if (!data.success) {
 throw new Error(data.error || 'Aktarım başlatılamadı');
 }

 const { transferId } = data;

 setTransferState({
 transferId,
 status: 'waiting_qr',
 progress: { total: data.totalSessions, completed: 0, failed: 0, current: 0 },
 errors: [],
 currentSession: undefined
 });

 const socket = io(SOCKET_URL, {
 path: '/socket.io',
 transports: ['websocket', 'polling']
 });

 socketRef.current = socket;

 socket.on('connect', () => {
 socket.emit('mebbis:subscribe', transferId);
 });

 socket.on('mebbis:progress', (progress) => {
 setTransferState(prev => ({ ...prev, progress }));
 });

 socket.on('mebbis:status', ({ status, message }) => {
 setTransferState(prev => ({ ...prev, status }));
 if (message) {
 toast.info(message);
 }
 });

 socket.on('mebbis:session-start', (session) => {
 setTransferState(prev => ({
 ...prev,
 currentSession: session
 }));
 });

 socket.on('mebbis:session-completed', (event: SessionCompletedEvent) => {
 if (event.success) {
 toast.success(`Öğrenci ${event.studentNo} başarıyla aktarıldı`);
 }
 });

 socket.on('mebbis:session-failed', (error: MEBBISTransferError) => {
 setTransferState(prev => ({
 ...prev,
 errors: [...prev.errors, error]
 }));
 toast.error(`Öğrenci ${error.studentNo} aktarılamadı: ${error.error}`);
 });

 socket.on('mebbis:transfer-completed', (summary) => {
 setTransferState(prev => ({ ...prev, status: 'completed' }));
 toast.success(
 `Aktarım tamamlandı! ${summary.successful} başarılı, ${summary.failed} başarısız`
 );
 socket.disconnect();
 });

 socket.on('mebbis:transfer-error', ({ error }) => {
 setTransferState(prev => ({ ...prev, status: 'error' }));
 toast.error(`Aktarım hatası: ${error}`);
 socket.disconnect();
 });

 return { success: true, transferId };
 } catch (error) {
 const err = error as Error;
 setTransferState(prev => ({ ...prev, status: 'error' }));
 toast.error(err.message);
 return { success: false, error: err.message };
 }
 }, []);

 const cancelTransfer = useCallback(async () => {
 if (!transferState.transferId) return;

 try {
 await fetch('/api/mebbis/cancel-transfer', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ transferId: transferState.transferId }),
 credentials: 'include'
 });

 if (socketRef.current) {
 socketRef.current.disconnect();
 }

 setTransferState(prev => ({ ...prev, status: 'cancelled' }));
 toast.info('Aktarım iptal edildi');
 } catch (error) {
 const err = error as Error;
 toast.error(`İptal hatası: ${err.message}`);
 }
 }, [transferState.transferId]);

 const resetTransfer = useCallback(() => {
 if (socketRef.current) {
 socketRef.current.disconnect();
 }
 setTransferState({
 transferId: null,
 status: 'idle',
 progress: { total: 0, completed: 0, failed: 0, current: 0 },
 errors: []
 });
 }, []);

 return {
 transferState,
 startTransfer,
 cancelTransfer,
 resetTransfer
 };
}
