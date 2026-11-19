import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout.tsx'
import { dataMode } from './config.ts'
import { ReferenceDataProvider } from './context/ReferenceDataProvider.tsx'
import { CatalogPage } from './pages/CatalogPage.tsx'
import { ConfigErrorPage } from './pages/ConfigErrorPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { MerchantPage } from './pages/MerchantPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { ProductPage } from './pages/ProductPage.tsx'

function App() {
  if (!dataMode) return <ConfigErrorPage />

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ReferenceDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="productos" element={<CatalogPage />} />
            <Route path="productos/:slug" element={<ProductPage />} />
            <Route path="comercios/:slug" element={<MerchantPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ReferenceDataProvider>
    </BrowserRouter>
  )
}

export default App
