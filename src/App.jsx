import { useState, useEffect } from "react";
import "./styles/App.css";

import { api } from "./lib/api";
import { filterProducts } from "./lib/products";
import { DEFAULT_CONFIG } from "./constants";
import useRoute from "./hooks/useRoute";
import useCart from "./hooks/useCart";
import useToast from "./hooks/useToast";
import { CategoriesContext } from "./hooks/useCategories";
import { mergeCategories } from "./lib/categories";

import Admin from "./admin/Admin";
import InfoPage from "./pages/InfoPage";
import ResetPassword from "./pages/ResetPassword";
import { navigate, productPath } from "./lib/router";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Banner from "./components/home/Banner";
import Brands from "./components/home/Brands";
import CategoryTiles from "./components/home/CategoryTiles";
import Features from "./components/home/Features";
import ProductGrid from "./components/products/ProductGrid";
import ProductModal from "./components/products/ProductModal";
import CartDrawer from "./components/cart/CartDrawer";
import AuthModal from "./components/auth/AuthModal";
import MyOrders from "./components/account/MyOrders";
import ProfileModal from "./components/account/ProfileModal";

export default function App() {
  const route = useRoute();
  const isAdmin = route.name === "admin";

  // Өгөгдөл
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [user, setUser] = useState(null);
  const [serverCats, setServerCats] = useState(null); // null = серверээс ирээгүй

  // Шүүлтүүр
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Бүгд");
  const [sort, setSort] = useState("default");

  // Нээлттэй цонхнууд
  const [cartOpen, setCartOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const cart = useCart(products);
  const [toast, setToast] = useToast();

  const loadProducts = () =>
    api("/products")
      .then((d) => {
        setProducts(d);
        setLoadError("");
      })
      .catch(() =>
        setLoadError(
          "Сервертэй холбогдож чадсангүй. Backend ажиллаж байгаа эсэхийг шалгана уу.",
        ),
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    if (isAdmin) return;
    loadProducts();
    api("/categories")
      .then((d) => setServerCats(Array.isArray(d) ? d : null))
      .catch(() => setServerCats(null));
    api("/config")
      .then((c) => setConfig({ ...DEFAULT_CONFIG, ...c }))
      .catch(() => {});
    api("/auth/me")
      .then(setUser)
      .catch(() => {});
  }, [isAdmin]);

  if (isAdmin) return <Admin />;

  // Барааны цонх URL-тай: /product/12-... (холбоосыг хуваалцаж болно)
  const openProduct = (p) => navigate(productPath(p), { scroll: false });
  const closeProduct = () => navigate("/", { scroll: false });
  const detail = route.productId
    ? products.find((p) => p.id === route.productId)
    : null;

  // ---------- Үйлдлүүд ----------
  const addToCart = (p, n = 1) =>
    setToast(
      cart.add(p, n)
        ? p.name + " сагсанд нэмэгдлээ"
        : "Нөөцөөс их нэмэх боломжгүй",
    );

  const onAuthDone = (u) => {
    setUser(u);
    setAuthMode(null);
    setToast("Тавтай морилно уу, " + u.name + "!");
  };

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setUser(null);
    setToast("Системээс гарлаа");
  };

  const openOrders = () => (user ? setOrdersOpen(true) : setAuthMode("login"));

  // ---------- Харуулах өгөгдөл ----------
  const list = filterProducts(products, { cat, query, sort });
  const categories = mergeCategories(serverCats, products);
  const brands = [...new Set(products.map((p) => p.brand))];
  const title = query.trim()
    ? `"${query.trim()}" хайлтын илэрц`
    : cat === "Бүгд"
      ? "Бүх бүтээгдэхүүн"
      : cat;

  return (
    <CategoriesContext.Provider value={categories}>
      <Header
        query={query}
        setQuery={setQuery}
        cartCount={cart.count}
        onCart={() => setCartOpen(true)}
        cat={cat}
        setCat={setCat}
        user={user}
        onLogin={() => setAuthMode("login")}
        onSignup={() => setAuthMode("signup")}
        onLogout={logout}
        onOrders={openOrders}
        onProfile={() => setProfileOpen(true)}
        freeFrom={config.freeDeliveryFrom}
      />

      {route.name === "reset" ? (
        <ResetPassword token={route.token} onDone={onAuthDone} />
      ) : route.name === "page" ? (
        <InfoPage slug={route.slug} />
      ) : (
        <>
          {!query.trim() && cat === "Бүгд" && (
            <>
              <Banner
                products={products}
                brandCount={brands.length}
                onOpen={openProduct}
              />
              <Features freeFrom={config.freeDeliveryFrom} />
              <CategoryTiles
                onPick={(c) => {
                  setCat(c);
                  document.getElementById("products")?.scrollIntoView();
                }}
              />
            </>
          )}
          <ProductGrid
            cat={cat}
            setCat={setCat}
            total={products.length}
            hasQuery={Boolean(query.trim())}
            list={list}
            loading={loading}
            error={loadError}
            sort={sort}
            setSort={setSort}
            onAdd={addToCart}
            onOpen={openProduct}
            title={title}
            onReset={() => {
              setQuery("");
              setCat("Бүгд");
            }}
          />
          <Brands brands={brands} />
        </>
      )}

      <Footer onOrders={openOrders} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        changeQty={cart.changeQty}
        removeItem={cart.remove}
        clearCart={cart.clear}
        user={user}
        config={config}
        onOrdered={loadProducts}
        onLogin={() => {
          setCartOpen(false);
          setAuthMode("login");
        }}
      />

      {detail && (
        <ProductModal
          key={detail.id}
          p={detail}
          inCart={cart.qtyOf(detail.id)}
          onAdd={addToCart}
          onClose={closeProduct}
        />
      )}
      {authMode && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthMode(null)}
          onDone={onAuthDone}
        />
      )}
      {ordersOpen && (
        <MyOrders
          onClose={() => setOrdersOpen(false)}
          onChanged={loadProducts}
        />
      )}
      {profileOpen && user && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onSaved={(u) => setUser((old) => ({ ...old, ...u }))}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </CategoriesContext.Provider>
  );
}
