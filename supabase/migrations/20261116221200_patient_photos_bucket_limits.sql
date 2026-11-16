-- Limites do bucket de fotos no servidor (antes só havia validação no navegador):
-- até 5 MB e apenas JPEG, PNG e WEBP (bloqueia SVG/HTML com tipo falso).
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'patient-photos';
