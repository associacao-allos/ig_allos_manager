-- Criação da tabela posts no Supabase
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('carrossel', 'reels', 'stories', 'estatico')),
    pilar VARCHAR(20) NOT NULL CHECK (pilar IN ('casas', 'educativo', 'institucional', 'bastidores', 'projeto_social', 'outro')),
    caption TEXT,
    link_canva TEXT,
    data_planejada TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ideia' CHECK (status IN ('ideia', 'criando', 'aprovado', 'agendado', 'publicado', 'cancelado')),
    criado_por VARCHAR(20) NOT NULL CHECK (criado_por IN ('victor', 'arthur')),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_posts_data_planejada ON posts (data_planejada);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_pilar ON posts (pilar);

-- RLS: desabilitar para uso com service_role_key
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON posts
    FOR ALL
    USING (true)
    WITH CHECK (true);
