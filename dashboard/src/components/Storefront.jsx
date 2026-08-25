import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Zap, Cpu, X, CreditCard, CheckCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Storefront.css';

const MOCK_PRODUCTS = [
  { id: 1, name: "Quantum Core Processor x9", price: 899.99, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80", tag: "Hot", category: "products" },
  { id: 2, name: "Neon Flux Graphics Unit", price: 1249.00, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80", category: "products" },
  { id: 3, name: "Neural Link Headset Pro", price: 349.50, image: "https://images.unsplash.com/photo-1550009158-9fdf6db2714a?w=500&q=80", tag: "New", category: "products" },
  { id: 4, name: "CyberDeck Keyboard Ultra", price: 199.99, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80", category: "products" },
  { id: 5, name: "Holo-Display Monitor 32\"", price: 699.00, image: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=500&q=80", tag: "-20%", category: "deals" },
  { id: 6, name: "Quantum Storage SSD 4TB", price: 450.00, image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500&q=80", category: "deals" },
  { id: 7, name: "Stealth Gaming Mouse", price: 89.99, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80", tag: "New", category: "products" },
  { id: 8, name: "RGB Liquid Cooling Rig", price: 210.50, image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&q=80", category: "products" }
];

const Storefront = () => {
  const navigate = useNavigate();
  const [systemState, setSystemState] = useState('healthy');
  const [metrics, setMetrics] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'checkout', 'processing', 'receipt'
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed'
  const [toastMessage, setToastMessage] = useState(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check auto-login state
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);
  
  // Continuously poll the python backend to detect AutoSRE anomalies and metrics
  useEffect(() => {
    const pollBackend = async () => {
      try {
        const [statusRes, metricsRes] = await Promise.all([
          fetch('http://localhost:8000/api/status'),
          fetch('http://localhost:8000/api/metrics')
        ]);
        if (statusRes.ok) {
          const data = await statusRes.json();
          setSystemState(data.system_state);
        }
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData);
        }
      } catch (error) {
        console.error("Backend unreachable.");
      }
    };

    const intervalId = setInterval(pollBackend, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const isPaymentDown = metrics?.paymentservice?.error_rate > 50 || metrics?.checkoutservice?.error_rate > 30;
  const isFrontendDown = metrics?.frontend?.error_rate > 15;

  const addToCart = (product) => {
    setCart([...cart, product]);
    setToastMessage("Product is added to cart successfully");
    setTimeout(() => setToastMessage(null), 3000);
  };
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckoutInitiation = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;
    if (isPaymentDown) return; // Block checkout if service is down
    setCheckoutStep('checkout');
  };

  const handleCancelPayment = () => {
    setCheckoutStep('cart');
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setCheckoutStep('processing');
    
    // Simulate network delay for transaction processing
    setTimeout(() => {
      // Check system health at moment of processing
      const currentPaymentDown = metrics?.paymentservice?.error_rate > 50 || metrics?.checkoutservice?.error_rate > 30;
      
      if (currentPaymentDown) {
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('success');
        setCart([]); // Clear cart on success
      }
      setCheckoutStep('receipt');
    }, 2500);
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setCheckoutStep('cart');
      setPaymentStatus(null);
    }, 300); // Reset state after modal closes
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter products by search dynamically
  const filteredProducts = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="storefront-root">

      {/* Toast Notification */}
      <div className={`cart-toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>

      {/* Cart & Checkout Modal */}
      {isCartOpen && (
        <div className="cart-modal-overlay" onClick={closeCart}>
          <div className="cart-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>{checkoutStep === 'checkout' ? 'Secure Checkout' : checkoutStep === 'receipt' ? 'Order Status' : checkoutStep === 'processing' ? 'Processing' : 'Your Cart'}</h2>
              <button className="close-btn" onClick={closeCart}><X size={24} /></button>
            </div>

            {checkoutStep === 'cart' && (
              <>
                <div className={`cart-items ${isPaymentDown ? 'glitch-container partial-crash-overlay' : ''}`}>
                  {isPaymentDown && (
                    <div className="glitch-overlay-text">
                      <Zap size={32} color="#FF3366"/>
                      <span>CART SERVICE UNSTABLE</span>
                    </div>
                  )}
                  {cart.length === 0 ? (
                    <p className="empty-cart">Your cart is empty.</p>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="cart-item">
                        <img src={item.image} alt={item.name} />
                        <div className="cart-item-info">
                          <h4>{item.name}</h4>
                          <p>${item.price.toFixed(2)}</p>
                        </div>
                        <button className="remove-btn" onClick={() => removeFromCart(index)}>
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className={`cart-footer ${isPaymentDown ? 'glitch-container partial-crash-overlay' : ''}`}>
                  {isPaymentDown && (
                    <div className="glitch-overlay-text" style={{fontSize: '0.9rem', flexDirection: 'row'}}>
                      <Zap size={18} color="#FF3366"/>
                      <span>CHECKOUT UNAVAILABLE</span>
                    </div>
                  )}
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    className={`checkout-btn ${isPaymentDown ? 'disabled-glitch' : ''}`} 
                    onClick={handleCheckoutInitiation}
                    disabled={cart.length === 0 || isPaymentDown}
                  >
                    Proceed to Checkout <CheckCircle size={18} />
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'checkout' && (
              <form className="checkout-form animate-fade-in" onSubmit={handleProcessPayment}>
                <div className="form-section">
                  <h3>Shipping Details</h3>
                  <input type="text" placeholder="Full Name" required defaultValue={currentUser?.name || ''} />
                  <input type="text" placeholder="Address" required defaultValue="1600 Amphitheatre Pkwy" />
                  <div className="form-row">
                    <input type="text" placeholder="City" required defaultValue="Mountain View" />
                    <input type="text" placeholder="ZIP" required defaultValue="94043" />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Payment Method</h3>
                  <div className="mock-card">
                    <div className="card-chip"></div>
                    <input type="text" className="card-number" placeholder="0000 0000 0000 0000" required maxLength="19" defaultValue="4111 1111 1111 1111" />
                    <div className="card-details">
                      <input type="text" placeholder="MM/YY" required maxLength="5" defaultValue="12/28" />
                      <input type="password" placeholder="CVV" required maxLength="4" defaultValue="123" />
                    </div>
                  </div>
                </div>

                <div className="checkout-actions">
                  <div className="checkout-total">To Pay: <b>${cartTotal.toFixed(2)}</b></div>
                  <div className="action-buttons">
                    <button type="button" className="cancel-btn" onClick={handleCancelPayment}>Cancel</button>
                    <button type="submit" className="pay-btn">Pay Now <CheckCircle size={16} /></button>
                  </div>
                </div>
              </form>
            )}

            {checkoutStep === 'processing' && (
              <div className="processing-state animate-fade-in">
                <div className="spinner"></div>
                <h3>Processing Transaction...</h3>
                <p>Please do not close this window.</p>
                <div className="secure-badge"><Cpu size={14}/> Secure connection to Payment Gateway</div>
              </div>
            )}

            {checkoutStep === 'receipt' && (
              <div className={`receipt-state animate-fade-in ${paymentStatus}`}>
                {paymentStatus === 'success' ? (
                  <>
                    <CheckCircle size={64} color="#00FF66" className="receipt-icon pulse" />
                    <h2>Payment Successful!</h2>
                    <p>Thank you for your order.</p>
                    <div className="order-details">
                      <span>Order ID: #{Math.floor(Math.random() * 900000) + 100000}</span>
                      <span>Amount Paid: ${cartTotal.toFixed(2)}</span>
                    </div>
                    <button className="continue-shopping-btn" onClick={closeCart}>Continue Shopping</button>
                  </>
                ) : (
                  <>
                    <Zap size={64} color="#FF3366" className="receipt-icon shake" />
                    <h2>Transaction Failed</h2>
                    <p>Microservice Error (503): Payment Gateway Offline or Timed Out. Please try again later.</p>
                    <div className="action-buttons" style={{marginTop: '2rem', width: '100%', justifyContent: 'center'}}>
                      <button className="cancel-btn" onClick={handleCancelPayment} style={{width: 'auto'}}>Return to Checkout</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="store-nav">
        <div className="nav-brand">
          <Zap color="#00F0FF" />
          <span>TECHNO<span>GEAR</span></span>
        </div>
        
        <div className="nav-links">
          <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>Products</a>
          <a href="#deals" onClick={(e) => scrollToSection(e, 'deals')}>Deals</a>
          <a href="#support" onClick={(e) => scrollToSection(e, 'support')}>Support</a>
        </div>
        
        <div className="nav-actions">
          {/* Dynamic Search Bar */}
          <div className={`search-container ${isSearchOpen ? 'search-open' : ''}`}>
            {isSearchOpen && (
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
            )}
            <Search size={20} style={{cursor: 'pointer'}} onClick={() => setIsSearchOpen(!isSearchOpen)} />
          </div>

          {/* Dynamic Profile Section */}
          <div className="user-profile-nav">
            <User size={20} style={{cursor: 'pointer'}} onClick={() => !currentUser && navigate('/login')} />
            {currentUser ? (
              <div className="user-info">
                <span>Hii {currentUser.name}</span>
                <LogOut size={14} style={{cursor: 'pointer', color: '#FF3366'}} onClick={handleLogout} title="Logout" />
              </div>
            ) : (
              <span style={{cursor: 'pointer', fontSize: '0.9rem', color: '#A0AEC0'}} onClick={() => navigate('/login')}>Login</span>
            )}
          </div>
          
          <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={20} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </nav>

      <main className="store-main">
        <section className="hero-section">
          <div className="hero-content">
            <span className="badge">Next-Gen Hardware</span>
            <h1>The Future of Computing is Here.</h1>
            <p>Upgrade your rig with enterprise-grade components. Experience zero latency and uncompromised power.</p>
            <button className="cta-button" onClick={(e) => scrollToSection(e, 'products')}>Shop Now</button>
          </div>
          <div className="hero-image-placeholder">
            <Cpu size={120} color="rgba(0, 240, 255, 0.4)" />
          </div>
        </section>

        <section id="products" className="products-section" style={{position: 'relative'}}>
          {isFrontendDown && (
            <div className="partial-crash-overlay" style={{borderRadius: '0'}}>
              <div className="glitch-container">
                <h1 className="glitch" data-text="503">503</h1>
                <h2>FRONTEND OVERLOADED</h2>
                <p className="crash-message">Product Catalog & UI components failing to load due to traffic spike.</p>
                <div className="system-recovery-loader">
                  <span className="load-pulse"></span> Auto-scaling...
                </div>
              </div>
            </div>
          )}
          
          <h2>Latest Hardware {searchQuery && `- Search results for "${searchQuery}"`}</h2>
          <div className="product-grid">
            {filteredProducts.filter(p => p.category === 'products').map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image" style={{ backgroundImage: `url(${product.image})` }}>
                  {product.tag && <span className="product-tag">{product.tag}</span>}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-bottom">
                    <span className="price">${product.price.toFixed(2)}</span>
                    <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="deals" className="products-section" style={{ background: '#0D0E15' }}>
          <h2>Special Deals</h2>
          <div className="product-grid">
            {filteredProducts.filter(p => p.category === 'deals').map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image" style={{ backgroundImage: `url(${product.image})` }}>
                  {product.tag && <span className="product-tag" style={{background: '#FF8A00'}}>{product.tag}</span>}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-bottom">
                    <span className="price" style={{color: '#FF8A00'}}>${product.price.toFixed(2)}</span>
                    <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="support" className="support-section">
           <h2>24/7 Technical Support</h2>
           <p>Our dedicated support team is available around the clock to assist you with compatibility, installation, and optimization configurations.</p>
           <button className="contact-btn">Contact Support</button>
        </section>
      </main>
      
      <footer className="store-footer">
        <p>&copy; 2026 TechnoGear Inc. All systems monitored by AutoSRE.</p>
      </footer>
    </div>
  );
};

export default Storefront;
