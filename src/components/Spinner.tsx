interface Props {
    label?: string
    tamaño?: 'sm' | 'md' | 'lg'
}

export default function Spinner({ label, tamaño = 'md' }: Props) {
    const tamaños = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-[3px]',
        lg: 'w-12 h-12 border-4',
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
            <div
                className={`${tamaños[tamaño]} rounded-full border-line-subtle border-t-accent animate-spin`}
            />
            {label && <p className="text-sm text-text-secondary">{label}</p>}
        </div>
    )
}
