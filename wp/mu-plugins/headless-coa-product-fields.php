<?php
/**
 * Plugin Name: Headless COA Product Fields
 * Description: COA PDF link + batch/lab fields on the WooCommerce product edit screen.
 *              Values power the PDP “Download COA” button via extensions.wchs_cro.
 * Version:     1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'add_meta_boxes',
	static function (): void {
		add_meta_box(
			'wchs-product-coa',
			__( 'Certificate of Analysis (COA)', 'wchs' ),
			'wchs_coa_render_product_meta_box',
			'product',
			'normal',
			'high'
		);
	},
	30
);

add_action( 'admin_enqueue_scripts', 'wchs_coa_admin_assets' );

add_action( 'woocommerce_admin_process_product_object', 'wchs_coa_save_product', 10, 1 );

add_action( 'woocommerce_product_after_variable_attributes', 'wchs_coa_render_variation_fields', 10, 3 );
add_action( 'woocommerce_save_product_variation', 'wchs_coa_save_variation', 10, 2 );

/**
 * @param string $hook
 */
function wchs_coa_admin_assets( string $hook ): void {
	if ( ! in_array( $hook, [ 'post.php', 'post-new.php' ], true ) ) {
		return;
	}
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || $screen->post_type !== 'product' ) {
		return;
	}
	wp_enqueue_media();
	wp_register_script( 'wchs-coa-product-admin', '', [], '1.0.0', true );
	wp_enqueue_script( 'wchs-coa-product-admin' );
	wp_add_inline_script(
		'wchs-coa-product-admin',
		<<<'JS'
(function () {
	function bindPicker(btn) {
		if (!btn || btn.dataset.wchsCoaBound) return;
		btn.dataset.wchsCoaBound = '1';
		btn.addEventListener('click', function (e) {
			e.preventDefault();
			var target = btn.getAttribute('data-target');
			var input = target ? document.querySelector(target) : null;
			if (!input) return;
			var frame = wp.media({
				title: 'Select COA PDF',
				button: { text: 'Use this file' },
				library: { type: [ 'application/pdf' ] },
				multiple: false
			});
			frame.on('select', function () {
				var attachment = frame.state().get('selection').first().toJSON();
				if (attachment && attachment.url) {
					input.value = attachment.url;
					input.dispatchEvent(new Event('input', { bubbles: true }));
				}
			});
			frame.open();
		});
	}
	document.querySelectorAll('.wchs-coa-pick-media').forEach(bindPicker);
})();
JS
	);
}

/**
 * @param \WP_Post $post
 */
function wchs_coa_render_product_meta_box( \WP_Post $post ): void {
	$product = wc_get_product( $post->ID );
	if ( ! $product ) {
		return;
	}
	wp_nonce_field( 'wchs_coa_save_product', 'wchs_coa_nonce' );
	wchs_coa_render_fields( (int) $product->get_id(), '' );
}

/**
 * @param int    $post_id
 * @param string $id_suffix Appended to field ids (variation loop index).
 */
function wchs_coa_render_fields( int $post_id, string $id_suffix = '' ): void {
	$url     = (string) get_post_meta( $post_id, '_wchs_coa_url', true );
	$batch   = (string) get_post_meta( $post_id, '_wchs_coa_batch', true );
	$lab     = (string) get_post_meta( $post_id, '_wchs_coa_lab', true );
	$url_id  = 'wchs_coa_url' . $id_suffix;
	$batch_id = 'wchs_coa_batch' . $id_suffix;
	$lab_id   = 'wchs_coa_lab' . $id_suffix;
	$name_url = $id_suffix === '' ? '_wchs_coa_url' : '_wchs_coa_url[' . $id_suffix . ']';
	$name_batch = $id_suffix === '' ? '_wchs_coa_batch' : '_wchs_coa_batch[' . $id_suffix . ']';
	$name_lab = $id_suffix === '' ? '_wchs_coa_lab' : '_wchs_coa_lab[' . $id_suffix . ']';
	?>
	<p class="description" style="margin-top:0">
		<?php esc_html_e( 'Upload a PDF to Media Library, then select it or paste the file URL. The storefront “Download COA” button uses this link.', 'wchs' ); ?>
	</p>
	<p class="form-field">
		<label for="<?php echo esc_attr( $url_id ); ?>"><?php esc_html_e( 'COA PDF URL', 'wchs' ); ?></label>
		<span style="display:flex;gap:8px;align-items:center;max-width:720px">
			<input
				type="url"
				class="widefat"
				id="<?php echo esc_attr( $url_id ); ?>"
				name="<?php echo esc_attr( $name_url ); ?>"
				value="<?php echo esc_attr( $url ); ?>"
				placeholder="https://yoursite.com/wp-content/uploads/.../coa.pdf"
				style="flex:1"
			/>
			<button type="button" class="button wchs-coa-pick-media" data-target="#<?php echo esc_attr( $url_id ); ?>">
				<?php esc_html_e( 'Select PDF', 'wchs' ); ?>
			</button>
		</span>
	</p>
	<p class="form-field" style="display:flex;gap:16px;flex-wrap:wrap">
		<span style="flex:1;min-width:200px">
			<label for="<?php echo esc_attr( $batch_id ); ?>"><?php esc_html_e( 'Batch ID (optional)', 'wchs' ); ?></label>
			<input
				type="text"
				class="widefat"
				id="<?php echo esc_attr( $batch_id ); ?>"
				name="<?php echo esc_attr( $name_batch ); ?>"
				value="<?php echo esc_attr( $batch ); ?>"
				placeholder="e.g. ALY-2026-0412"
			/>
		</span>
		<span style="flex:1;min-width:200px">
			<label for="<?php echo esc_attr( $lab_id ); ?>"><?php esc_html_e( 'Lab name (optional)', 'wchs' ); ?></label>
			<input
				type="text"
				class="widefat"
				id="<?php echo esc_attr( $lab_id ); ?>"
				name="<?php echo esc_attr( $name_lab ); ?>"
				value="<?php echo esc_attr( $lab ); ?>"
				placeholder="e.g. Analytical Laboratories Inc."
			/>
		</span>
	</p>
	<?php
}

/**
 * @param \WC_Product $product
 */
function wchs_coa_save_product( \WC_Product $product ): void {
	if ( ! isset( $_POST['wchs_coa_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wchs_coa_nonce'] ) ), 'wchs_coa_save_product' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_product', $product->get_id() ) ) {
		return;
	}
	wchs_coa_persist_meta( $product->get_id(), [
		'url'   => isset( $_POST['_wchs_coa_url'] ) ? wp_unslash( $_POST['_wchs_coa_url'] ) : '',
		'batch' => isset( $_POST['_wchs_coa_batch'] ) ? wp_unslash( $_POST['_wchs_coa_batch'] ) : '',
		'lab'   => isset( $_POST['_wchs_coa_lab'] ) ? wp_unslash( $_POST['_wchs_coa_lab'] ) : '',
	] );
}

/**
 * @param int      $loop
 * @param array    $variation_data
 * @param \WP_Post $variation
 */
function wchs_coa_render_variation_fields( int $loop, array $variation_data, \WP_Post $variation ): void {
	echo '<div class="form-row form-row-full wchs-coa-variation-fields" style="border-top:1px solid #eee;margin-top:12px;padding-top:12px">';
	echo '<p><strong>' . esc_html__( 'COA (optional override)', 'wchs' ) . '</strong></p>';
	wchs_coa_render_fields( (int) $variation->ID, '_' . $loop );
	echo '</div>';
}

/**
 * @param int $variation_id
 * @param int $loop
 */
function wchs_coa_save_variation( int $variation_id, int $loop ): void {
	if ( ! current_user_can( 'edit_post', $variation_id ) ) {
		return;
	}
	$urls   = $_POST['_wchs_coa_url'] ?? [];
	$batches = $_POST['_wchs_coa_batch'] ?? [];
	$labs   = $_POST['_wchs_coa_lab'] ?? [];
	if ( ! is_array( $urls ) ) {
		return;
	}
	wchs_coa_persist_meta(
		$variation_id,
		[
			'url'   => $urls[ $loop ] ?? '',
			'batch' => is_array( $batches ) ? ( $batches[ $loop ] ?? '' ) : '',
			'lab'   => is_array( $labs ) ? ( $labs[ $loop ] ?? '' ) : '',
		]
	);
}

/**
 * @param int                  $post_id
 * @param array{url: string, batch: string, lab: string} $data
 */
function wchs_coa_persist_meta( int $post_id, array $data ): void {
	$url = esc_url_raw( (string) $data['url'] );
	update_post_meta( $post_id, '_wchs_coa_url', $url );
	update_post_meta( $post_id, 'coa_url', $url );
	update_post_meta( $post_id, '_wchs_coa_batch', sanitize_text_field( (string) $data['batch'] ) );
	update_post_meta( $post_id, '_wchs_coa_lab', sanitize_text_field( (string) $data['lab'] ) );
}
