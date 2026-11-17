import type { ChangeEvent, RefObject } from "react"
import { Camera, Trash2 } from "lucide-react"

type PatientPhotoFieldProps = {
  photoPreview: string | null
  initials: string
  hasCurrentImage: boolean // o paciente já tinha foto salva
  hasNewPhoto: boolean
  removePhoto: boolean
  error?: string
  compressionMessage: string
  isCompressing: boolean
  isSaving: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClearSelection: () => void
  onMarkForRemoval: () => void
}

export function PatientPhotoField({
  photoPreview,
  initials,
  hasCurrentImage,
  hasNewPhoto,
  removePhoto,
  error,
  compressionMessage,
  isCompressing,
  isSaving,
  inputRef,
  onPhotoChange,
  onClearSelection,
  onMarkForRemoval,
}: PatientPhotoFieldProps) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      {photoPreview ? (
        // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:) ou URL assinada
        <img
          src={photoPreview}
          alt="Prévia da foto de perfil"
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-2xl font-semibold text-white">
          {initials}
        </div>
      )}
      <div>
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${error ? "border-red-500" : "border-slate-300"}`}
        >
          <Camera size={16} />
          Trocar foto
          <input
            type="file"
            ref={inputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={onPhotoChange}
            disabled={isCompressing || isSaving}
            className="sr-only"
          />
        </label>
        <p className="mt-1 text-xs text-slate-500">
          JPG, PNG ou WEBP. A foto é otimizada automaticamente.
        </p>
        {(hasNewPhoto || removePhoto || error) && (
          <button
            type="button"
            onClick={onClearSelection}
            disabled={isCompressing || isSaving}
            className="mt-1 block text-xs font-medium text-amber-700 underline disabled:opacity-50"
          >
            {hasNewPhoto
              ? "Desfazer troca da foto"
              : hasCurrentImage || removePhoto
                ? "Manter foto atual"
                : "Limpar erro da foto"}
          </button>
        )}
        {hasCurrentImage && !hasNewPhoto && !removePhoto && (
          <button
            type="button"
            onClick={onMarkForRemoval}
            disabled={isCompressing || isSaving}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 underline transition-colors hover:text-red-700 active:text-red-800 disabled:opacity-50"
          >
            <Trash2 size={14} />
            Remover foto
          </button>
        )}
        {removePhoto && (
          <p className="mt-1 text-xs text-slate-500">
            A foto será removida ao salvar.
          </p>
        )}
        {isCompressing && (
          <p className="mt-1 text-xs text-slate-500">Comprimindo foto...</p>
        )}
        {compressionMessage && !error && (
          <p className="mt-1 text-xs text-emerald-700">
            {compressionMessage}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
