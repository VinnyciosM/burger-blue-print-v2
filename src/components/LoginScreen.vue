<template>
    <div class="login-wrapper">
        <div class="login-container">

            <!-- Lado Esquerdo: Imagem -->
            <div class="login-image-side">
                <div class="image-overlay">
                    <div class="image-text">
                        <h2>Transforme seus guias em realidade.</h2>
                        <p>O parceiro ideal para organizar e imprimir seus projetos com precisão.</p>
                    </div>
                </div>
            </div>

            <!-- Lado Direito: Formulário -->
            <div class="login-form-side">

                <!-- PASSO 1: PEDIR E-MAIL -->
                <div v-if="step === 'email'" class="form-step">
                    <div class="form-header">
                        <h2>Entrar no Keeta</h2>
                        <p>Digite seu e-mail para receber um código de acesso.</p>
                    </div>

                    <form class="login-form">
                        <div class="input-group">
                            <label>E-mail</label>
                            <input type="email" placeholder="seu@email.com" class="dark-input" />
                        </div>

                        <button type="button" @click="step = 'code'" class="btn-primary">
                            Continuar com e-mail
                        </button>
                    </form>

                    <!-- Divisor -->
                    <div class="divider">
                        <span>ou</span>
                    </div>

                    <!-- Botões Sociais -->
                    <div class="social-login">
                        <button type="button" class="btn-social">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4" />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853" />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05" />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335" />
                            </svg>
                            Google
                        </button>

                        <button type="button" class="btn-social">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.33.82 3.1 .88.88-.04 2.11-.87 3.65-.77 1.48.06 2.76.67 3.55 1.76-2.9 1.69-2.38 5.61.43 6.77-.73 1.83-1.74 3.4-2.73 4.33zM12.03 7.25c-.15-2.58 2.08-4.8 4.67-5.25.33 2.72-2.34 4.96-4.67 5.25z" />
                            </svg>
                            Apple
                        </button>
                    </div>
                </div>

                <!-- PASSO 2: DIGITAR O CÓDIGO -->
                <div v-else class="form-step">

                    <button @click="step = 'email'" class="btn-back">
                        ← Voltar
                    </button>

                    <div class="form-header">
                        <h2>Verifique seu e-mail</h2>
                        <p>Enviamos um código de acesso temporário para o e-mail informado.</p>
                    </div>

                    <form class="login-form">
                        <div class="input-group">
                            <label>Código de acesso</label>
                            <!-- Um input espaçado para dar cara de código de verificação -->
                            <input type="text" placeholder="Ex: 849 201" class="dark-input code-input" maxlength="7" />
                        </div>

                        <button type="button" class="btn-primary">
                            Entrar
                        </button>
                    </form>

                    <p class="resend-text">
                        Não recebeu? <a href="#">Reenviar código</a>
                    </p>

                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// Variável apenas para você testar a transição de telas no visual (email -> code)
const step = ref('email') 
</script>

<style scoped>
/* Fundo da tela */
.login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background-color: #121212;
    font-family: sans-serif;
    padding: 20px;
    box-sizing: border-box;
}

.login-container {
    display: flex;
    width: 100%;
    max-width: 1000px;
    min-height: 600px;
    background-color: #1a1a1a;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.4);
    border: 1px solid #2a2a2a;
}

/* Lado Esquerdo - Imagem */
.login-image-side {
    flex: 1;
    background-image: url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
}

.image-overlay {
    background: linear-gradient(to bottom, rgba(18, 18, 18, 0.2) 0%, rgba(18, 18, 18, 0.9) 100%);
    width: 100%;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
}

.brand-logo {
    color: #111;
    background: #facc15;
    width: fit-content;
    font-weight: 900;
    padding: 6px 14px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.85rem;
}

.image-text h2 {
    color: #fff;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
    margin: 0 0 12px 0;
}

.image-text p {
    color: #ccc;
    font-size: 1rem;
    line-height: 1.5;
    margin: 0;
}

/* Lado Direito - Formulário */
.login-form-side {
    flex: 1;
    padding: 60px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #161616;
    box-sizing: border-box;
    position: relative;
}

/* Transições suaves entre passos */
.form-step {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.form-header {
    margin-bottom: 32px;
}

.form-header h2 {
    margin: 0 0 8px 0;
    color: #fff;
    font-size: 1.8rem;
    font-weight: 800;
}

.form-header p {
    margin: 0;
    color: #888;
    font-size: 0.9rem;
    line-height: 1.4;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
}

.input-group label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #ccc;
}

.dark-input {
    background-color: #121212;
    border: 1px solid #333;
    border-radius: 8px;
    color: white;
    padding: 14px 16px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
}

.dark-input:focus {
    border-color: #f38b41;
}

.code-input {
    letter-spacing: 4px;
    font-weight: bold;
    text-align: center;
    font-size: 1.2rem;
}

.btn-primary {
    background-color: #f38b41;
    color: #121212;
    border: none;
    padding: 14px;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.95rem;
    margin-top: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover {
    background-color: #d17530;
}

.btn-primary:active {
    transform: scale(0.98);
}

.btn-back {
    background: transparent;
    border: none;
    color: #888;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-bottom: 24px;
    text-align: left;
    transition: color 0.2s;
    width: fit-content;
}

.btn-back:hover {
    color: #fff;
}

.resend-text {
    margin-top: 24px;
    text-align: center;
    color: #888;
    font-size: 0.85rem;
}

.resend-text a {
    color: #f38b41;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.2s;
}

.resend-text a:hover {
    opacity: 0.8;
}

/* Divisor Visual */
.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 32px 0;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #333;
}

.divider span {
    padding: 0 16px;
    color: #666;
    font-size: 0.75rem;
    font-weight: 500;
}

/* Botões Sociais */
.social-login {
    display: flex;
    gap: 16px;
}

.btn-social {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: transparent;
    border: 1px solid #333;
    color: #e5e5e5;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-social:hover {
    background-color: #222;
    border-color: #555;
}

.btn-social:active {
    transform: scale(0.98);
}

@media (max-width: 768px) {
    .login-container {
        flex-direction: column;
        min-height: auto;
    }

    .login-image-side {
        display: none;
    }

    .login-form-side {
        padding: 40px 24px;
    }

    .social-login {
        flex-direction: column;
    }
}
</style>