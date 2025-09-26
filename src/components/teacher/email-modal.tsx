'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Student {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  commissionName: string;
  status: string;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSendEmail: (emailData: EmailData) => Promise<void>;
}

interface EmailData {
  recipients: string[];
  subject: string;
  message: string;
}

export function EmailModal({ isOpen, onClose, students, onSendEmail }: EmailModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Por favor completa el asunto y el mensaje');
      return;
    }

    setSending(true);
    try {
      await onSendEmail({
        recipients: students.map(s => s.studentEmail),
        subject,
        message
      });
      
      // Reset form
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error al enviar el email. Por favor intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSubject('');
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>✉️</span>
            Enviar Email a Estudiantes
          </DialogTitle>
          <DialogDescription>
            Envía un mensaje personalizado a los estudiantes seleccionados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipients */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Destinatarios ({students.length})
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-muted/30">
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.studentId} className="flex items-center gap-3 p-2 bg-card rounded-md">
                    {student.studentAvatar ? (
                      <Image
                        src={student.studentAvatar}
                        alt={student.studentName}
                        className="w-8 h-8 rounded-full object-cover"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {student.studentName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.studentEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={student.status === 'at_risk' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {student.status === 'at_risk' ? 'En Riesgo' : 
                         student.status === 'active' ? 'Activo' : 
                         student.status === 'behind' ? 'Atrasado' : 'Desconocido'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="text-sm font-medium mb-2 block">
              Asunto *
            </label>
            <Input
              id="subject"
              placeholder="Ej: Seguimiento académico - Semillero Digital"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="text-sm font-medium mb-2 block">
              Mensaje *
            </label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Sé específico sobre las áreas que necesitan mejorar y ofrece recursos de apoyo.
            </p>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Plantillas rápidas
            </label>
            <div className="grid gap-2 md:grid-cols-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubject('Seguimiento académico - Semillero Digital');
                  setMessage(`Estimado/a estudiante,

Espero que te encuentres bien. Me pongo en contacto contigo para hacer un seguimiento de tu progreso en el Semillero Digital.

He notado que podrías necesitar apoyo adicional en algunas áreas. Me gustaría programar una reunión para conversar sobre cómo podemos ayudarte a alcanzar tus objetivos académicos.

Por favor, responde a este email para coordinar un horario que te convenga.

Saludos cordiales,
[Tu nombre]`);
                }}
                disabled={sending}
              >
                📝 Seguimiento General
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubject('Tareas pendientes - Acción requerida');
                  setMessage(`Hola,

He revisado tu progreso y veo que tienes algunas tareas pendientes que requieren tu atención inmediata.

Es importante que te pongas al día para no afectar tu rendimiento general en el curso. Si necesitas ayuda o tienes alguna dificultad, no dudes en contactarme.

Recursos disponibles:
- Horarios de consulta: [Especificar horarios]
- Material de apoyo: [Enlaces o referencias]

Quedo atento a tu respuesta.

Saludos,
[Tu nombre]`);
                }}
                disabled={sending}
              >
                ⚠️ Tareas Pendientes
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={sending || !subject.trim() || !message.trim()}>
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <span className="mr-2">✉️</span>
                Enviar Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
