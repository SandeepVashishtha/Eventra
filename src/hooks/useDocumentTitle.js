import { useEffect } from 'react'

const useDocumentTitle = (title) => {
    useEffect(() => {
        if (typeof document === "undefined") return;
        const previousTitle = document.title
        document.title = title

        return () => {
            document.title = previousTitle
        }
    }, [title])
}

export default useDocumentTitle