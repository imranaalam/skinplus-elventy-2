const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");

module.exports = function (eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css",
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	// App plugins
	eleventyConfig.addPlugin(pluginDrafts);
	eleventyConfig.addPlugin(pluginImages);

	// Official plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
			format || "dd LLLL yyyy"
		);
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", (collection) => {
		let tagSet = new Set();
		for (let item of collection) {
			(item.data.tags || []).forEach((tag) => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(
			(tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
		);
	});

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", (mdLib) => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "#",
				ariaHidden: false,
			}),
			level: [1, 2, 3, 4],
			slugify: eleventyConfig.getFilter("slugify"),
		});
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

	////////////////////////////////////////
	// add short codes
	/////////////////////////

	///////////////////
	// banner slider
	//////////////////

	/*

	{% bannerSlider {
		backgroundImage: "/path/to/your-image.jpg",
		leftImage: "/path/to/your-left-image.jpg",
		rightImage: "/path/to/your-right-image.jpg",
		mainTitle: "Custom Title",
		subTitle: "Custom Subtitle",
		buttonLink: "/custom-link",
		buttonText: "Custom Button Text"
	} %}
    

    */

	eleventyConfig.addShortcode(
		"bannerSlider",
		function ({
			backgroundImage = "https://via.placeholder.com/1920x1100", // Default background image
			leftImage = "https://via.placeholder.com/600x400", // Default left image
			rightImage = "https://via.placeholder.com/600x400", // Default right image
			mainTitle = "Beauty Studio",
			subTitle = "A salon is an establishment dealing with natural cosmetic treatments.",
			buttonLink = "#",
			buttonText = "Book Appointment",
		}) {
			return `
			<!-- start banner slider -->
			<section class="pb-0 top-space-padding bg-dark-gray full-screen border-top position-relative md-h-700px sm-h-600px sm-pb-70px" style="background-image: url('${backgroundImage}')">
				<div class="position-absolute left-0px top-0px d-none d-lg-inline-block" data-anime='{ "el": "childs", "translateY": [100, 0], "opacity": [0,1], "duration": 600, "delay": 600, "staggervalue": 300, "easing": "easeOutQuad" }'>
					<img src="${leftImage}" data-bottom-top="transform: translateY(-150px)" data-top-bottom="transform: translateY(150px)" alt="Decorative image">
				</div>
				<div class="pe-8 pt-8 absolute-middle-right lg-pe-2 lg-pt-2 d-none d-lg-inline-block">
					<img src="${rightImage}" class="animation-rotation" alt="Decorative image">
				</div>
				<div class="container h-100">
					<div class="row align-items-center h-100">
						<div class="col-md-6 position-relative" data-anime='{ "el": "childs", "translateY": [30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue": 300, "easing": "easeOutQuad" }'>  
							<div class="alt-font fs-150 text-white ls-minus-3px lh-120 mb-25px lg-fs-120 xs-fs-90 xs-lh-80 lg-lh-100">${mainTitle}</div> 
							<div class="text-light-medium-gray fs-20 w-60 mb-35px xs-mb-25px lg-w-75 md-w-100 sm-w-70 xs-w-90">${subTitle}</div>
							<a href="${buttonLink}" class="btn btn-extra-large btn-base-color btn-hover-animation-switch btn-round-edge btn-box-shadow">
								<span>
									<span class="btn-text">${buttonText}</span>
									<span class="btn-icon"><i class="fa-solid fa-arrow-right fs-14"></i></span>
									<span class="btn-icon"><i class="fa-solid fa-arrow-right fs-14"></i></span>
								</span> 
							</a>
						</div>
					</div> 
				</div>
			</section>
			<!-- end banner slider -->
			`;
		}
	);

	///////////////////
	// feature section
	////////////////

	//  usage
	// {% featureSection {
	// 	leftImageUrl: "/path/to/custom-image.jpg",
	// 	awardTitle: "Local Best Salon",
	// 	awardYear: "2024",
	// 	description: "Offering the finest beauty services in the region.",
	// 	discountText: "Special 25% off for new customers",
	// 	discountLink: "/special-offer"
	// } %}

	eleventyConfig.addShortcode(
		"featureSection",
		function ({
			leftImageUrl = "https://via.placeholder.com/95x125", // Default left image
			awardTitle = "Best beauty salon", // Default title
			awardYear = "2023", // Default award year
			description = "Multi award winning beauty salon services.", // Default description
			discountText = "Get 20% off on bridal makeup", // Default discount text
			discountLink = "/current-page", // Default to the current page
		}) {
			return `
			<section class="p-0 position-relative border-bottom border-color-extra-medium-gray">
				<div class="container">
					<div class="w-50 bg-white position-absolute top-minus-40px left-0px text-end">
						<div class="fs-15 lh-30 text-dark-gray pt-5px pb-5px ps-25px pe-25px fw-600 d-inline-block bg-yellow">wow awesome!</div>
					</div>
					<div class="row align-items-center">
						<div class="col-lg-6 icon-with-text-style-01 pt-40px pb-40px pe-8 lg-pe-15px xs-pb-30px border-end md-border-end-0 md-border-bottom border-color-extra-medium-gray" data-anime='{ "el": "childs", "translateX": [-30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue":200, "easing": "easeOutQuad" }'>
							<div class="feature-box feature-box-left-icon-middle last-paragraph-no-margin">
								<div class="feature-box-icon me-25px">
									<img src="${leftImageUrl}" class="h-65px" alt="">
								</div>
								<div class="feature-box-content">
									<h6 class="text-dark-gray fw-400 mb-0 alt-font ls-minus-05px">${awardTitle} <span class="text-decoration-line-bottom-medium">award ${awardYear}</span></h6>
									<p>${description}</p>
								</div>
							</div>
						</div>
						<div class="col-lg-6 pt-40px pb-40px xs-pt-30px ps-8 lg-ps-15px" data-anime='{ "el": "childs", "translateX": [30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue":200, "easing": "easeOutQuad" }'>
							<h6 class="fw-400 mb-0 alt-font"><a href="${discountLink}" class="text-dark-gray text-dark-gray-hover">${discountText}<i class="bi bi-arrow-right align-middle icon-extra-medium position-relative top-3px md-top-0px ms-10px"></i></a></h6>
						</div>
					</div>
				</div>
			</section>
			`;
		}
	);

	///////////////////
	// featuredSection
	////////////////

	///
	// usage
	// {% featuredSection {
	//     mainImageUrl: "/path/to/custom-image.jpg",
	//     title: "Our Commitment",
	//     description: "Explore our extensive range of services.",
	//     primaryLink: "/learn-more",
	//     primaryButtonText: "Learn More",
	//     secondaryUrl: "https://www.youtube.com/watch?v=XYZ",
	//     secondaryButtonText: "Watch Video"
	// } %}
	///

	eleventyConfig.addShortcode(
		"featuredSection",
		function ({
			mainImageUrl = "https://via.placeholder.com/960x630", // Default image if none provided
			title = "Explore Our Services", // Default title
			description = "Detailed overview of our services and commitments.", // Default description
			primaryLink = "#", // Default primary link
			primaryButtonText = "Learn More", // Default text for primary button
			secondaryUrl = "https://www.youtube.com/watch?v=XYZ", // Default video URL
			secondaryButtonText = "Watch Video", // Default text for video button
		}) {
			return `
        <section class="p-0">
            <div class="container-fluid p-0"> 
                <div class="row align-items-center g-0">
                    <div class="col-xl-6 col-lg-6 position-relative top-minus-2px md-mb-30p appear " data-anime='{ "effect": "slide", "color": "#f2e0dc", "direction":"lr", "easing": "easeOutQuad", "duration": 600, "delay":500}'> 
                        <img src="${mainImageUrl}" class="border-radius-rb-50px" alt="">
                    </div>
                    <div class="col-xl-4 col-lg-6 offset-xl-1 lg-ps-15px lg-pe-15px text-center text-lg-start appear anime-child anime-complete" data-anime='{ "el": "childs", "translateY": [30, 0], "opacity": [0,1], "duration": 600, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'> 
                        <span class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 mb-10px ls-1px d-inline-block">${title}</span>
                        <h2 class="alt-font fw-400 text-dark-gray w-75 xl-w-90 lg-w-100 ls-minus-1px">${title}</h2>
                        <p class="mb-30px w-60 xl-w-90 lg-w-100 lg-mb-25px">${description}</p>
                        <div class="d-sm-flex align-items-center justify-content-center justify-content-lg-start">
                            <a href="${primaryLink}" class="btn btn-large btn-dark-gray btn-hover-animation-switch btn-round-edge btn-box-shadow xs-me-20px xs-mb-10px">
                                <span>
                                    <span class="btn-text">${primaryButtonText}</span>
                                    <span class="btn-icon"><i class="feather icon-feather-arrow-right"></i></span>
                                    <span class="btn-icon"><i class="feather icon-feather-arrow-right"></i></span>
                                </span>
                            </a>
                            <a href="${secondaryUrl}" class="btn btn-link hover-text-light btn-extra-large text-dark-gray popup-youtube xs-ps-0 xs-mb-10px"><i class="bi bi-play-circle align-middle lh-normal icon-extra-medium me-10px"></i>${secondaryButtonText}</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;
		}
	);

	///////////////////
	// processStepsSection
	//////////////////

	/*
   usage
   {% processStepsSection {
       steps: [
           { number: "01", title: "Excellent care", description: "No compromises" },
           { number: "02", title: "Cruelty free", description: "Not tested on animals" },
           { number: "03", title: "Certified experts", description: "Professional people" }
       ]
   } %}
*/

	eleventyConfig.addShortcode("processStepsSection", function ({ steps = [] }) {
		if (!Array.isArray(steps)) {
			console.error(
				"Invalid 'steps' provided to 'processStepsSection'. Expected an array."
			);
			return ""; // Return an empty string or some error message in the output if desired
		}

		let stepItems = steps
			.map(
				(step) => `
        <div class="col process-step-style-08 ${
					step.isEnd ? "" : "border-end border-color-extra-medium-gray"
				} d-flex justify-content-center ${
					step.isEnd ? "" : "md-border-end-0 md-mb-40px"
				}">
            <div class="process-step-item d-flex align-items-start">
                <div class="process-step-icon-wrap d-flex align-items-center col-auto">
                    <span class="number text-dark-gray fs-26 alt-font">${
											step.number
										}</span>
                    <span class="progress-step-separator bg-base-color w-20px separator-line-2px d-block ms-15px"></span>
                </div>
                <div class="col process-content last-paragraph-no-margin ms-15px">
                    <span class="d-block text-dark-gray fs-24 alt-font">${
											step.title
										}</span>
                    <p>${step.description}</p>
                </div>
            </div>
        </div>
    `
			)
			.join("");

		return `
        <section class="border-bottom border-color-extra-medium-gray pt-4 pb-4">
            <div class="container">
                <div class="row align-items-center row-cols-1 row-cols-lg-3 row-cols-md-2 justify-content-center" data-anime='{ "el": "childs", "translateX": [-20, 0], "opacity": [0,1], "duration": 600, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'>  
                    ${stepItems}
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// ServicesSection
	//////////////////

	/*
   Usage
   /* {% ServicesSection {
       headerText: "Beauty salon services",
       headerSubText: "Makeup and hairstyles",
       services: [
           {
               imageUrl: "https://via.placeholder.com/755x510",
               title: "Hair treatment",
               description: "Advanced hair treatment",
               link: "/hair-treatment.html"
           },
           {
               imageUrl: "https://via.placeholder.com/755x510",
               title: "Reflexology",
               description: "Different amounts of pressure",
               link: "/reflexology.html"
           },
           {
               imageUrl: "https://via.placeholder.com/755x510",
               title: "Makeup",
               description: "Rethink your lash look",
               link: "/makeup.html"
           },
           {
               imageUrl: "https://via.placeholder.com/755x510",
               title: "Skin care",
               description: "Believe in your beauty",
               link: "/skin-care.html"
           },
           {
               imageUrl: "https://via.placeholder.com/755x510",
               title: "Cosmetology",
               description: "Fabulous in every way",
               link: "/cosmetology.html"
           },
           {
               imageUrl: "https://via.placeholder.com/755x510",
               title: "Grooming",
               description: "Especially crafted to suit",
               link: "/grooming.html"
           }
       ],
       exploreLink: "/pricing-plans.html",
       exploreText: "View All Pricing Plans",
       learnMoreLink: "/about.html",
       learnMoreText: "Learn More About Us"
   } %}
*/

	eleventyConfig.addShortcode(
		"ServicesSection",
		function ({
			headerText,
			headerSubText,
			services,
			exploreLink,
			exploreText,
			learnMoreLink,
			learnMoreText,
		}) {
			const serviceItems = services
				.map(
					(service) => `
        <div class="col mb-20px">
            <div class="services-box-style-01 hover-box">
                <div class="position-relative box-image border-radius-6px overflow-hidden">
                    <a href="${service.link || "#"}">
                        <img src="${
													service.imageUrl ||
													"https://via.placeholder.com/755x510"
												}" alt="">
                        <div class="box-overlay bg-gradient-blue-ironstone-brown"></div>
                        <span class="d-flex justify-content-center align-items-center mx-auto icon-box absolute-middle-center z-index-1 w-65px h-65px rounded-circle border border-color-transparent-white border-1"><i class="bi bi-arrow-right-short text-white icon-very-medium d-flex"></i></span>
                    </a>
                </div>
                <div class="p-25px last-paragraph-no-margin text-center">
                    <span class="fs-22 text-dark-gray alt-font">${
											service.title
										}</span>
                    <p class="lh-26">${service.description}</p>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="overlap-height">
            <div class="container overlap-gap-section">
                <div class="row justify-content-center align-items-center mb-6" data-anime='{ "el": "childs", "translateY": [30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue":200, "easing": "easeOutQuad" }'>
                    <div class="col-auto pe-25px border-2 border-end border-color-dark-gray sm-border-end-0 sm-pe-15px">
                        <span class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px">${headerText}</span>
                    </div>
                    <div class="col-12 col-md-auto ps-25px sm-ps-15px text-center">
                        <h3 class="alt-font fw-400 text-dark-gray ls-minus-1px mb-0">${headerSubText}</h3>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-lg-3 row-cols-md-2 transition-inner-all justify-content-center mb-4" data-anime='{ "el": "childs", "translateY": [20, 0], "opacity": [0,1], "duration": 600, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'>
                    ${serviceItems}
                </div>
                <div class="row">
                    <div class="col-12 text-center">
                        <h6 class="text-dark-gray alt-font">Our flexible beauty salon pricing plans. <a href="${exploreLink}" class="text-dark-gray text-dark-gray-hover text-decoration-line-bottom-medium">${exploreText}</a></h6>
                        <a href="${learnMoreLink}" class="btn btn-large btn-dark-gray btn-hover-animation-switch btn-round-edge btn-box-shadow xs-me-20px xs-mb-10px">
                            <span>
                                <span class="btn-text">${learnMoreText}</span>
                                <span class="btn-icon"><i class="feather icon-feather-arrow-right"></i></span>
                                <span class="btn-icon"><i the "feather icon-feather-arrow-right"></i></span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// PricingSection
	//////////////////

	/*
   Usage
   /* {% PricingSection {
       headerText: "Beauty salon services",
       headerSubText: "Makeup and hairstyles",
       pricing: [
           {
               imageUrl: "https://via.placeholder.com/100x105",
               title: "Hair wash and dry",
               description: "Quick hair wash and blow",
               price: "$35"
           }
       ],
       exploreLink: "/demo-beauty-salon-wedding.html",
       exploreText: "Explore package",
       learnMoreLink: "/about-us.html",
       learnMoreText: "Learn More"
   } %}
*/

	eleventyConfig.addShortcode(
		"PricingSection",
		function ({
			headerText,
			headerSubText,
			pricing,
			exploreLink = "#",
			exploreText = "Explore package",
			learnMoreLink = "#",
			learnMoreText = "Learn More",
		}) {
			const pricingItems = pricing
				.map(
					(item) => `
        <div class="col-lg-6 pe-50px lg-pe-30px md-pe-15px pricing-table-style-09"  data-anime='{ "el": "childs", "translateX": [30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue":200, "easing": "easeOutQuad" }'>
            <div class="row border-top border-color-extra-medium-gray g-0 xs-pt-20px xs-pb-20px">
                <div class="col-sm-3 text-center align-self-center">
                    <img src="${
											item.imageUrl || "https://via.placeholder.com/100x105"
										}" class="w-55px" alt="">
                </div>
                <div class="col-sm-7 text-center text-sm-start last-paragraph-no-margin ps-40px pe-40px pt-30px pb-30px border-start border-color-extra-medium-gray">
                    <span class="alt-font text-dark-gray fs-20">${
											item.title
										}</span>
                    <p class="lh-26">${item.description}</p>
                </div>
                <div class="col-sm-2 text-center text-sm-start align-self-center">
                    <h4 class="alt-font text-dark-gray mb-0 fw-400">${
											item.price
										}</h4>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="overlap-height">
            <div class="container overlap-gap-section">
                <div class="row">
                    <div class="col-12 text-center">
                        <h6 class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px">${headerText}</h6>
                        <h3 class="alt-font fw-400 text-dark-gray ls-minus-1px mb-6">${headerSubText}</h3>
                    </div>
                </div>
                <div class="row justify-content-between align-items-center mb-5 xs-mb-6"  data-anime='{ "el": "childs", "translateX": [-30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue":200, "easing": "easeOutQuad" }'>
                    ${pricingItems}
                </div>
				<div class="row">
				<div class="col-12 text-center">
					<h6 class="text-dark-gray alt-font">Our flexible beauty salon pricing plans. <a href="${exploreLink}" class="text-dark-gray text-dark-gray-hover text-decoration-line-bottom-medium">${exploreText}</a></h6>
					<a href="${learnMoreLink}" class="btn btn-large btn-dark-gray btn-hover-animation-switch btn-round-edge btn-box-shadow xs-me-20px xs-mb-10px">
						<span>
							<span class="btn-text">${learnMoreText}</span>
							<span class="btn-icon"><i class="feather icon-feather-arrow-right"></i></span>
							<span class="btn-icon"><i class="feather icon-feather-arrow-right"></i></span>
						</span>
					</a>
				</div>
			</div>
			
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// BenefitsSection
	//////////////////

	/*
   Usage
   /* {% BenefitsSection {
       headerText: "Open your body and soul to yoga",
       headerSubText: "Still need some reasons to start practicing meditation?",
       benefits: [
           {
               imageUrl: "https://via.placeholder.com/100x100",
               title: "Improves strength and flexibility",
               description: "Strength and flexibility improvements"
           },
           {
               imageUrl: "https://via.placeholder.com/100x100",
               title: "Yoga can ease arthritis symptoms",
               description: "Ease arthritis symptoms through yoga"
           },
           {
               imageUrl: "https://via.placeholder.com/100x100",
               title: "Yoga helps with back pain relief",
               description: "Helpful yoga positions for back pain relief"
           }

       ],
       primaryLink: "/learn-more.html",
       primaryButtonText: "Learn More"
   } %}
*/

	eleventyConfig.addShortcode(
		"BenefitsSection",
		function ({
			headerText,
			headerSubText,
			benefits,
			primaryLink = "#",
			primaryButtonText = "Learn More",
		}) {
			const benefitItems = benefits
				.map(
					(benefit) => `
        <div class="col icon-with-text-style-04 transition-inner-all">
            <div class="feature-box box-shadow-triple-large-hover h-100 border-bottom border-end border-color-extra-medium-gray md-border-bottom p-18 lg-p-11">
                <div class="feature-box-icon mb-20px">
                    <img src="${
											benefit.imageUrl || "https://via.placeholder.com/100x100"
										}" alt="" data-no-retina="">
                </div>
                <div class="feature-box-content">
                    <span class="d-block text-dark-gray fs-19 lh-28">${
											benefit.title
										}</span>
                    <p>${benefit.description}</p>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
    <section class="overlap-height">
        <div class="container">
            <div class="row justify-content-center mb-3" data-anime='{ "el": "childs", "translateY": [30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue":200, "easing": "easeOutQuad" }' >
                <div class="col-xl-6 col-lg-8 text-center">
                    <span class="fs-15 fw-600 text-base-color text-uppercase ls-3px">${headerText}</span>
                    <h3 class="alt-font text-dark-gray ls-minus-1px">${headerSubText}</h3>
                </div>
            </div>
            <div class="row row-cols-1 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 text-center icon-with-style-2 g-0 border-top border-start border-color-extra-medium-gray" data-anime='{ "el": "childs", "translateY": [20, 0], "opacity": [0,1], "duration": 600, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'>
                ${benefitItems}
            </div>
      
        </div>
        </section>
    `;
		}
	);

	///////////////////
	// ImageAndTextSection
	//////////////////

	/*
   Usage
   /* {% ImageAndTextSection {
       mainImage: "https://via.placeholder.com/580x450",
       featureIcon: "https://via.placeholder.com/120x84",
       featureText: "One of the leading cardiac centres.",
       headerIcon: "bi bi-bookmark-star", // Bootstrap icon class
       headerText: "Clinical excellence",
       slides: [
           {
               title: "Best advanced infrastructure.",
               text: "Lorem ipsum dolor sit amet consectetur adipiscing elit do eiusmod tempor incididunt ut labore et dolore magna ut enim veniam."
           },
           {
               title: "Certified renal transplant.",
               text: "Lorem ipsum dolor sit amet consectetur adipiscing elit do eiusmod tempor incididunt ut labore et dolore magna ut enim veniam."
           },
           {
               title: "Microscope for tumor surgery.",
               text: "Lorem ipsum dolor sit amet consectetur adipiscing elit do eiusmod tempor incididunt ut labore et dolore magna ut enim veniam."
           }
       ]
   } %}
*/

	eleventyConfig.addShortcode(
		"ImageAndTextSection",
		function ({
			mainImage,
			featureIcon,
			featureText,
			headerIcon,
			headerText,
			slides,
		}) {
			const slideItems = slides
				.map(
					(slide) => `
        <div class="swiper-slide">
            <h2 class="alt-font text-dark-gray ls-minus-1px">${slide.title}</h2>
            <p class="w-80">${slide.text}</p>
        </div>
    `
				)
				.join("");

			return `
        <!-- start section -->
        <section>
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-xl-6 col-lg-6 md-mb-50px" data-anime='{ "effect": "slide", "color": "#feedec", "direction":"lr", "easing": "easeOutQuad", "delay":50}'>
                        <figure class="position-relative m-0">
                            <img src="${mainImage}" alt="" class="border-radius-6px w-100">
                            <figcaption class="position-absolute bg-white box-shadow-extra-large border-radius-6px right-25px bottom-25px w-300px xs-w-250px p-25px xs-p-15px text-center last-paragraph-no-margin">
                                <!-- start features box item -->
                                <div class="icon-with-text-style-08">
                                    <div class="feature-box feature-box-left-icon-middle overflow-hidden">
                                        <div class="feature-box-icon w-60px xs-w-50px me-20px xs-me-15px">
                                            <img src="${featureIcon}" class="animation-zoom" alt="">
                                        </div>
                                        <div class="feature-box-content">
                                            <span class="d-inline-block fs-18 lh-24 text-dark-gray">${featureText}</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- end features box item -->
                            </figcaption>
                        </figure>
                    </div>
                    <div class="col-xl-5 col-lg-6 pe-lg-0 offset-xl-1" data-anime='{ "translateY": [0, 0], "opacity": [1], "duration": 1200, "delay": 150, "easing": "easeOutQuad" }'>
                        <span class="fs-18 fw-600 text-dark-gray mb-20px d-flex align-items-center">
                            <span class="text-center w-60px h-60px d-flex justify-content-center align-items-center rounded-circle bg-light-sea-green-transparent-light d-inline-block align-middle me-15px">
                                <i  class="${headerIcon} fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px"></i>
                            </span>
							<div  class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px">${headerText} </div>
                        </span> 
                        <div class="swiper slider-one-slide text-slider-style-01 magic-cursor" data-slider-options='{ "slidesPerView": 1, "loop": true, "pagination": { "el": ".slider-one-slide-pagination", "clickable": true }, "autoplay": { "delay": 4000, "disableOnInteraction": false }, "navigation": { "nextEl": ".slider-one-slide-next-1", "prevEl": ".slider-one-slide-prev-1" }, "keyboard": { "enabled": true, "onlyInViewport": true }, "effect": "slide" }'>
                            <div class="swiper-wrapper">
                                ${slideItems}
                            </div>
                            <div class="d-flex">
                                <div class="slider-one-slide-prev-1 icon-small swiper-button-prev slider-navigation-style-04 border border-1 border-color-extra-medium-gray bg-white text-dark-gray"><i class="fa-solid fa-arrow-left"></i></div>
                                <div class="slider-one-slide-next-1 icon-small swiper-button-next slider-navigation-style-04 border border-1 border-color-extra-medium-gray bg-white text-dark-gray"><i class="fa-solid fa-arrow-right"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- end section -->
    `;
		}
	);

	///////////////////
	// MarqueeSection
	//////////////////

	/*
   Usage
   /*

   {% MarqueeSection {
    messages: [
        { text: "Pay with multiple credit cards" },
        { text: "Get 20% off for your first order" },
        { text: "The fashion core collection" },
        { text: "100% secure protected payment" },
        { text: "Free shipping for orders over $130" }
    ]
   } %}

*/

	eleventyConfig.addShortcode("MarqueeSection", function ({ messages }) {
		const messageItems = messages
			.map(
				(message, index) => `
        <div class="swiper-slide swiper-slide-next" role="group" aria-label="${
					index + 1
				} / ${messages.length}" data-swiper-slide-index="${index}">
            <div class="alt-font fs-26 fw-500 text-dark-gray border-color-extra-medium-gray border-end pt-30px pb-30px ps-60px pe-60px sm-p-25px">${
							message.text
						}</div>
        </div>
    `
			)
			.join("");

		return `
        <section class="p-0 border-top border-bottom border-color-extra-medium-gray">
            <div class="container-fluid">
                <div class="row position-relative">
                    <div class="col swiper text-center swiper-width-auto swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ 'slidesPerView': 'auto', 'spaceBetween': 0, 'speed': 10000, 'loop': true, 'pagination': { 'el': '.slider-four-slide-pagination-2', 'clickable': false }, 'allowTouchMove': false, 'autoplay': { 'delay': 0, 'disableOnInteraction': false }, 'navigation': { 'nextEl': '.slider-four-slide-next-2', 'prevEl': '.slider-four-slide-prev-2' }, 'keyboard': { 'enabled': true, 'onlyInViewport': true }, 'effect': 'slide' }">
                        <div class="swiper-wrapper marquee-slide" id="swiper-wrapper-10cf8e6adb59d2157" aria-live="off" style="transition-duration: 10000ms; transform: translate3d(-2335.33px, 0px, 0px);">
                            ${messageItems}
                        </div>
                        <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
                    </div>
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// CategoryShowcaseSection
	//////////////////

	/*
   Usage
   /*

   {%  CategoryShowcaseSection  {
    categories: [
        { icon: "Microphone-4", title: "Publishing", link: "#publishing" },
        { icon: "Basket-Coins", title: "Finance", link: "#finance" },
        { icon: "Bee", title: "Sciences", link: "#sciences" },
        { icon: "Management", title: "Consultant", link: "#consultant" },
        { icon: "French-Fries", title: "Food", link: "#food" },
        { icon: "Road-3", title: "Travel", link: "#travel" },
        { icon: "Cow", title: "Dairy", link: "#dairy" },
        { icon: "Diamond", title: "Jewellery", link: "#jewellery" },
        { icon: "Drop", title: "Energy", link: "#energy" },
        { icon: "Environmental-3", title: "Farming", link: "#farming" },
        { icon: "Gear", title: "Industries", link: "#industries" },
        { icon: "Environmental-3", title: "Events", link: "#events" }
    ]
   } %}

*/

	eleventyConfig.addShortcode(
		"CategoryShowcaseSection",
		function ({ categories }) {
			const categoryItems = categories
				.map(
					(category) => `
        <div class="col icon-with-text-style-04 transition-inner-all">
            <div class="feature-box hover-box h-100 transition dark-hover pt-25 pb-25 xs-p-12 last-paragraph-no-margin overflow-hidden border-bottom border-end border-1 border-color-transparent-white-light border-color-transparent-on-hover">
                <div class="feature-box-icon">
                    <i class="line-icon-${category.icon} icon-extra-large text-white mb-15px"></i>
                </div>
                <div class="feature-box-content">
                    <span class="d-inline-block text-white fw-600 fs-14 text-uppercase">${category.title}</span>
                </div>
                <div class="feature-box-overlay bg-base-color"></div>
                <a href="${category.link}" class="stretched-link"></a>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="bg-dark-gray">
            <div class="container">
                <div class="row justify-content-center mb-5 sm-mb-30px">
                    <div class="col-xl-6 col-lg-8 col-md-10 text-center" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;:0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                        <h3 class="text-white mb-0 fw-600">Explore our diverse categories.</h3>
                    </div>
                </div>
                <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-0 " data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [15, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 300, &quot;delay&quot;:0, &quot;staggervalue&quot;: 100, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                    ${categoryItems}
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// statbox
	//////////////////

	/*

{% 
statsBox "4.98", "98", "200", "4.98 rating.", 
"Genuine positive feedback.", 
"Daily patients consulted.", 5
 %}



*/

	eleventyConfig.addShortcode(
		"statsBox",
		function (
			rating,
			feedback,
			patients,
			ratingText,
			feedbackText,
			patientsText,
			stars
		) {
			let starIcons = "";
			for (let i = 0; i < stars; i++) {
				starIcons += '<i class="bi bi-star-fill text-dark-gray"></i>';
			}

			return `
	<section class="pt-0 position-relative">
	<div class="container">
	<div class="row align-items-center">
	  <div class="row row-cols-1 row-cols-lg-3 row-cols-sm-2 mt-5 align-items-center justify-content-center" data-anime="{ "el": "childs", "translateY": [30, 0], "opacity": [0,1], "duration": 800, "delay": 0, "staggervalue": 200, "easing": "easeOutQuad" }">
		  <!-- start content box item -->
		  <div class="col md-mb-40px border-end xs-border-end-0 border-color-transparent-dark-very-light" style="">
			  <div class="d-flex flex-column flex-md-row justify-content-center align-items-center text-center text-md-start">
				  <div class="flex-shrink-0 me-25px sm-me-0">
					  <h2 class="mb-0 text-dark-gray fw-600 alt-font  ls-minus-2px">${rating}</h2>
				  </div>
				  <div> 
					  <div class="fs-18 lh-32 last-paragraph-no-margin text-dark-gray">
						  ${starIcons}
					  </div>
					  <span class="fs-18 lh-26 d-block fw-600 text-dark-gray">${ratingText}</span>
				  </div>
			  </div>
		  </div>
		  <!-- end content box item -->
		  <!-- start content box item -->
		  <div class="col md-mb-40px border-end md-border-end-0 border-color-transparent-dark-very-light" style="">
			  <div class="d-flex flex-column flex-md-row justify-content-center align-items-center text-center text-md-start">
				  <div class="flex-shrink-0 me-25px sm-me-0">
					  <h2 class="mb-0 text-dark-gray fw-600 alt-font  ls-minus-2px">${feedback}<sup class="fs-30">%</sup></h2>
				  </div>
				  <div> 
					  <span class="fs-18 text-dark-gray lh-26 d-block fw-600">${feedbackText.replace(
							" ",
							"<br>"
						)}</span>
				  </div>
			  </div>
		  </div>
		  <!-- end content box item -->
		  <!-- start content box item -->
		  <div class="col text-dark-gray fw-600" style="">
			  <div class="d-flex flex-column flex-md-row justify-content-center align-items-center text-center text-md-start">
				  <div class="flex-shrink-0 me-25px sm-me-0">
					  <h2 class="mb-0 text-dark-gray fw-600 alt-font  ls-minus-2px">${patients}<sup class="fs-30">+</sup></h2>
				  </div>
				  <div> 
					  <span class="fs-18 lh-26 d-block fw-600">${patientsText.replace(
							" ",
							"<br>"
						)}</span>
				  </div>
			  </div>
		  </div>
		  <!-- end content box item -->
	  </div>
	  </div>
	  </div>
	  </section>
	`;
		}
	);

	///////////////////
	// ServiceSliderSection
	//////////////////

	/*
   Usage
   /* {% ServiceSliderSection {
       backgroundPatternImage: "images/demo-medical-pattern.svg",
       mainTitle: "Our advance services",
       subTitle: "Our clinical departments.",
       description: "Lorem ipsum is simply dummy text printing typesetting industry's standard.",
       linkUrl: "demo-medical-treatments.html",
       linkText: "All treatments",
       slides: [
           {
               iconUrl: "images/demo-medical-icon-04.svg",
               title: "Blood test",
               text: "Lorem ipsum is simply dummy text of simply printing typesetting.",
               detailUrl: "demo-medical-treatments.html"
           },
           {
               iconUrl: "images/demo-medical-icon-02.svg",
               title: "Cardiology",
               text: "Lorem ipsum is simply dummy text of simply printing typesetting.",
               detailUrl: "demo-medical-treatments.html"
           }
       ]
   } %}
*/

	eleventyConfig.addShortcode(
		"ServiceSliderSection",
		function ({
			backgroundPatternImage,
			mainTitle,
			subTitle,
			description,
			linkUrl,
			linkText,
			slides,
		}) {
			const slideItems = slides
				.map(
					(slide) => `
        <div class="swiper-slide">
            <div class="icon-with-text-style-02 transition-inner-all">
                <div class="feature-box bg-white text-start hover-box dark-hover border-radius-6px p-15 xl-p-12 box-shadow-medium">
                    <div class="feature-box-icon feature-box-icon-rounded w-110px h-110px bg-light-turquoise-blue rounded-circle mb-20px">
                        <img src="${slide.iconUrl}" class="w-50px" alt="" data-no-retina="">
                    </div>
                    <div class="feature-box-content">
                        <span class="d-block text-dark-gray fs-19 fw-700 mb-5px">${slide.title}</span>
                        <p class="text-light-opacity">${slide.text}</p>
                        <a href="${slide.detailUrl}" class="btn btn-extra-large btn-link text-dark-gray border-bottom-0 left-icon fw-700"><i class="feather icon-feather-plus-circle icon-extra-medium ms-0"></i>Know more</a>
                    </div> 
                    <div class="feature-box-overlay bg-base-color border-radius-6px"></div>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="pt-0 position-relative">
            <div class="position-absolute top-minus-70px lg-top-minus-50px left-minus-80px lg-left-minus-60px lg-w-300px opacity-1 w-350px z-index-1 d-none d-lg-inline-block"><img src="${backgroundPatternImage}" alt="" data-bottom-top="transform: translateY(-50px)" data-top-bottom="transform: translateY(50px)" class="" data-no-retina=""></div>
            <div class="bg-light-red border-radius-8px lg-no-border-radius pt-6 pb-6 md-pt-50px md-pb-50px overflow-hidden position-relative">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-xl-4 col-lg-5 md-mb-30px" data-anime="{&quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 800, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot;}"> 
                            <span class="fs-18 fw-600 text-dark-gray mb-20px d-flex align-items-center"><span class="text-center w-60px h-60px d-flex justify-content-center align-items-center rounded-circle bg-light-sea-green-transparent-light align-middle me-15px"><i class="bi bi-shield-check text-base-color fs-22"></i></span>${mainTitle}</span>
                            <h2 class="fw-600 alt-font  text-dark-gray ls-minus-2px">${subTitle}</h2>
                            <p class="mb-30px">${description}</p>
                            <a href="${linkUrl}" class="btn btn-medium btn-switch-text btn-dark-gray btn-round-edge">
                                <span>
                                    <span class="btn-double-text" data-text="${linkText}">${linkText}</span> 
                                </span>
                            </a>
                        </div>
                        <div class="col-xl-8 ps-5 col-lg-7">
                            <div class="outside-box-right-25 sm-outside-box-right-0" data-anime="{ &quot;translateY&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 100, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot;}">
                                <div class="swiper magic-cursor ps-15px md-ps-0 swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ &quot;slidesPerView&quot;: 1, &quot;spaceBetween&quot;: 30, &quot;loop&quot;: true, &quot;autoplay&quot;: { &quot;delay&quot;: 4000, &quot;disableOnInteraction&quot;: false },  &quot;pagination&quot;: { &quot;el&quot;: &quot;.slider-four-slide-pagination-1&quot;, &quot;clickable&quot;: true, &quot;dynamicBullets&quot;: false }, &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;breakpoints&quot;: { &quot;1200&quot;: { &quot;slidesPerView&quot;: 3 }, &quot;768&quot;: { &quot;slidesPerView&quot;: 2 }, &quot;320&quot;: { &quot;slidesPerView&quot;: 1 } }, &quot;effect&quot;: &quot;slide&quot;}">
                                    <div class="swiper-wrapper pt-30px pb-20px" aria-live="off">
                                        ${slideItems}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// AppointmentRequestSection
	//////////////////

	/*
   Usage
   /* {% AppointmentRequestSection {
       urgentContactImage: "https://via.placeholder.com/112x68",
       backgroundImage: "https://via.placeholder.com/448x434",
       contactNumber: "+1 234 567 8910",
       formActionURL: "/path/to/submit/appointment",
       doctorOptions: [
           {value: "Pediatrician - Dr. Bryan Johnson", text: "Pediatrician - Dr. Bryan Johnson"},
           {value: "Cardiology - Dr. Jemmy Watson", text: "Cardiology - Dr. Jemmy Watson"},
           {value: "Neurology - Dr. Jeremy Dupont", text: "Neurology - Dr. Jeremy Dupont"},
           {value: "Orthopedics - Dr. Evan Thomson", text: "Orthopedics - Dr. Evan Thomson"},
           {value: "Optometrists - Dr. Shoko Mugikura", text: "Optometrists - Dr. Shoko Mugikura"}
       ]
   } %}
*/

	eleventyConfig.addShortcode(
		"AppointmentRequestSection",
		function ({
			urgentContactImage = "https://via.placeholder.com/112x68",
			backgroundImage = "https://via.placeholder.com/448x434",
			contactNumber = "+1 234 567 8910",
			formActionURL = "/submit/appointment",
			doctorOptions = [],
		}) {
			let optionsHTML = doctorOptions
				.map(
					(option) => `<option value="${option.value}">${option.text}</option>`
				)
				.join("");

			return `
        <section class="position-relative" id="appointment">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-xl-4 col-lg-5 md-mb-50px">
                        <h2 class="fw-600 alt-font text-dark-gray ls-minus-2px">Request an appointment.</h2>
                        <p class="w-90 md-w-100 mb-30px">Your information will be forwarded to a scheduling specialist who will contact you.</p>
                        <div class="row g-0 align-items-center">
                            <div class="col-auto">
                                <img class="me-15px" src="${urgentContactImage}" alt="" data-no-retina="">
                            </div>
                            <div class="col">
                                <span class="fw-600 text-dark-gray">For urgent matters<br><a href="tel:${contactNumber.replace(
																	/\s+/g,
																	""
																)}" class="fs-22 ls-minus-05px fw-600 alt-font ">${contactNumber}</a></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-8 col-lg-7">
                        <div class="contact-form-style-05">
                            <!-- start contact form -->
                            <form action="${formActionURL}" method="post">
                                <div class="row justify-content-center">
                                    <div class="col-md-6 sm-mb-25px">
                                        <input class="mb-25px form-control required" type="text" name="name" placeholder="Patient's full name*">
                                        <input class="mb-25px form-control required" type="text" name="email" placeholder="Patient's email*">
                                        <div class="date-time row gutter-very-small">
                                            <div class="date-icon col-xl-6 lg-mb-25px">
                                                <input class="form-control" type="date" name="date" value="2023-01-01" min="2023-01-01" max="2099-12-31" aria-label="date"> 
                                            </div>
                                            <div class="time-icon col-xl-6"> 
                                                <input class="form-control" type="time" name="time" value="09:12" min="09:00" max="12:00" aria-label="time"> 
                                            </div>
                                        </div>
                                    </div>   
                                    <div class="col-md-6">
                                        <div class="mb-25px select">
                                            <select class="form-control" name="select" aria-label="select-doctor">
                                                <option value="">Select doctor</option>
                                                ${optionsHTML}
                                            </select>
                                        </div>
                                        <textarea class="form-control" cols="20" rows="4" name="comment" placeholder="Your message"></textarea>
                                    </div>
                                    <div class="col-md-6 mt-25px sm-mt-20px">
                                        <p class="mb-0 fs-13 lh-24 text-center text-md-start">We are committed to protecting your privacy. We will never collect information about you without your explicit consent.</p>
                                    </div>
                                    <div class="col-md-6 text-center text-md-end mt-25px sm-mt-20px">
                                        <input type="hidden" name="redirect" value="">
                                        <button class="btn btn-medium btn-base-color btn-round-edge left-icon btn-box-shadow submit" type="submit"><i class="bi bi-calendar-check"></i>Book appointment</button>
                                    </div>
                                    <div class="col-12">
                                        <div class="form-results mt-20px d-none text-center"></div>
                                    </div>
                                </div>
                            </form>
                            <!-- end contact form -->
                        </div>
                    </div>
                    <div class="position-absolute bottom-minus-15px right-100px lg-right-0px z-index-minus-1 opacity-1 w-300px lg-w-200px"><img src="${backgroundImage}" alt="" data-bottom-top="transform: translateY(-50px)" data-top-bottom="transform: translateY(50px)" data-no-retina=""></div>
                </div>
            </section>
    `;
		}
	);

	///////////////////
	// DynamicMediaSection
	//////////////////

	/*
   Usage
   /* {% DynamicMediaSection {
       mainImage: "https://via.placeholder.com/435x559",
       iconImage: "https://via.placeholder.com/58x51",
       secondaryImage: "https://via.placeholder.com/336x430",
       sectionTitle: "About medcare hospital",
       header: "Welcome to our medcare hospital.",
       description: "We value each and every human life placed in our hands and constantly work towards meeting the expectations of our customers and stake holders.",
       primaryLink: "demo-medical-about.html",
       primaryButtonText: "About hospital",
       secondaryLink: "demo-medical-timetable.html",
       secondaryButtonText: "Check timetable"
   } %}
*/

	eleventyConfig.addShortcode(
		"DynamicMediaSection",
		function ({
			mainImage = "https://via.placeholder.com/435x559",
			iconImage = "https://via.placeholder.com/58x51",
			secondaryImage = "https://via.placeholder.com/336x430",
			sectionTitle = "About medcare hospital",
			header = "Welcome to our medcare hospital.",
			description = "We value each and every human life placed in our hands and constantly work towards meeting the expectations of our customers and stake holders.",
			primaryLink = "demo-medical-about.html",
			primaryButtonText = "About hospital",
			secondaryLink = "demo-medical-timetable.html",
			secondaryButtonText = "Check timetable",
		}) {
			return `
        <section class="position-relative">
            <div class="container">
                <div class="row align-items-center justify-content-center"> 
                    <div class="col-lg-6 col-md-10 md-mb-15 xs-mb-20 offset-lg-0 offset-md-1 position-relative"> 
                        <div class="w-75 shadow-in" data-animation-delay="200" data-shadow-animation="true" data-bottom-top="transform: translateY(50px)" data-top-bottom="transform: translateY(-50px)">
                            <img src="${mainImage}" alt="" class="border-radius-6px w-100" data-no-retina="">
                            <div class="position-absolute left-minus-70px lg-left-minus-15px md-left-minus-50px bottom-130px lg-bottom-90px md-mb-50px d-none d-md-flex flex-column align-items-center justify-content-center w-140px h-140px bg-white border-radius-100 p-10px box-shadow-quadruple-large">
                                <img src="${iconImage}" class="position-absolute top-50 translate-middle-y" alt="" data-no-retina="">
                                <img src="images/demo-medical-home-07.png" class="animation-rotation" alt="" data-no-retina="">
                            </div>
                        </div>
                        <div class="w-55 overflow-hidden position-absolute right-15px bottom-minus-50px shadow-in" data-shadow-animation="true" data-animation-delay="100" data-bottom-top="transform: translateY(-20px)" data-top-bottom="transform: translateY(20px)">
                            <img src="${secondaryImage}" alt="" class="border-radius-6px box-shadow-quadruple-large w-100" data-no-retina="">
                        </div>
                    </div> 
                    <div class="col-xl-5 offset-xl-1 col-lg-6 text-right text-md-start">
                        <span class="fs-18 fw-600 text-dark-gray mb-20px d-flex align-items-center"><span class="text-center w-60px h-60px d-flex justify-content-center align-items-center rounded-circle bg-light-sea-green-transparent-light align-middle me-15px"><i class="bi bi-layout-text-sidebar-reverse text-base-color fs-20"></i></span>${sectionTitle}</span>
                        <h2 class="fw-800 text-dark-gray ls-minus-2px">${header}</h2> 
                        <p class="mb-30px w-95 lg-w-100 xs-mb-25px">${description}</p> 
                        <div class="row align-items-center text-right text-sm-start">
                            <div class="col-sm-auto xs-mb-10px">
                                <h2 class="alt-font text-dark-gray mb-0 d-inline-block align-middle me-10px fw-800">722+</h2>
                                <div class="text-center bg-golden-yellow text-white fs-14 ls-1px border-radius-4px d-inline-block ps-15px pe-15px lh-34 align-middle me-5px"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i></div>
                            </div>
                            <div class="col-sm border-start border-2 border-color-dark-gray ps-25px ms-10px xl-ps-20px xs-border-start-0 xs-ps-15px xs-pe-15px xs-m-0">
                                <p class="m-0 lh-24 text-dark-gray fw-600">5 star reviews from our satisfied people.</p>
                            </div>
                        </div>
                        <div class="d-inline-block mt-40px xs-mt-30px">
                            <a href="${primaryLink}" class="btn btn-medium btn-switch-text btn-dark-gray btn-round-edge me-15px xs-me-5px">
                                <span>
                                    <span class="btn-double-text" data-text="Trusted doctor">${primaryButtonText}</span> 
                                </span>
                            </a>
                            <a href="${secondaryLink}" class="btn btn-medium btn-switch-text left-icon btn-transparent-light-gray border-color-transparent-dark-gray btn-round-edge xs-mt-15px">
                                <span>
                                    <span><i class="feather icon-feather-calendar"></i></span>
                                    <span class="btn-double-text" data-text="Check timetable">${secondaryButtonText}</span> 
                                </span>
                            </a>
                        </div>
                    </div> 
                </div> 
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// DynamicShowcaseSection
	//////////////////

	/*
   Usage
   /*

   {% set DynamicShowcaseSection = {
    banners: [
        {
            imageUrl: "https://via.placeholder.com/1160x640",
            tag: "Flat 50% off",
            title: "Bridal makeup",
            description: "Special packages for wedding.",
            link: "demo-beauty-salon-wedding.html"
        },
        {
            imageUrl: "https://via.placeholder.com/1160x640",
            tag: "Flat 50% off",
            title: "Expert makeup",
            description: "Unlock your true beauty potential.",
            link: "demo-beauty-salon-wedding.html"
        }
    ],
    headerText: "Associates brand",
    headerSubText: "Brands available",
    clients: [
        {
            imageUrl: "https://via.placeholder.com/225x110",
            link: "#"
        },
        {
            imageUrl: "https://via.placeholder.com/225x110",
            link: "#"
        }
    ]
} %}


*/

	eleventyConfig.addShortcode(
		"DynamicShowcaseSection",
		function ({ banners, headerText, headerSubText, clients }) {
			const bannerItems = banners
				.map(
					(banner) => `
        <div class="col interactive-banner-style-08 md-mb-30px">
            <figure class="m-0 hover-box overflow-hidden position-relative border-radius-6px">
                <img src="${
									banner.imageUrl || "https://via.placeholder.com/1160x640"
								}" alt="" data-no-retina="">
                <figcaption class="d-flex flex-column align-items-start justify-content-center position-absolute left-0px top-0px w-100 h-100 z-index-1 p-50px sm-p-6">
                    <span class="ps-15px pe-15px pt-5px pb-5px text-uppercase text-dark-gray fs-13 lh-24 fw-700 border-radius-4px bg-white d-inline-block">${
											banner.tag
										}</span>
                    <div class="d-flex w-100 align-items-center mt-auto">
                        <div class="col last-paragraph-no-margin pe-15px">
                            <h5 class="alt-font text-white mb-0">${
															banner.title
														}</h5>
                            <p class="lh-38 text-white fw-300 ls-05px opacity-6 mb-0">${
															banner.description
														}</p>
                        </div>
                        <span class="border border-2 border-color-transparent-white-very-light bg-transparent w-60px h-60px sm-w-50px sm-h-50px rounded-circle ms-auto position-relative">
                            <i class="bi bi-arrow-right-short absolute-middle-center icon-very-medium lh-0px text-white"></i>
                        </span>
                    </div>
                    <div class="position-absolute left-0px top-0px w-100 h-100 bg-gradient-gray-light-dark-transparent z-index-minus-1 opacity-9"></div>
                    <a href="${
											banner.link
										}" class="position-absolute z-index-1 top-0px left-0px h-100 w-100"></a>
                </figcaption>
            </figure>
        </div>
    `
				)
				.join("");

			const clientItems = clients
				.map(
					(client) => `
        <div class="col text-center border-end border-bottom border-color-transparent-dark-very-light sm-border-end-0 transition-inner-all pt-40px pb-40px sm-pt-30px sm-pb-30px">
            <div class="client-box">
                <a href="${client.link}"><img src="${
						client.imageUrl || "https://via.placeholder.com/225x110"
					}" alt="" data-no-retina=""></a>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="bg-gradient-solitude-blue-fair-pink">
            <div class="container">
                <div class="row row-cols-1 row-cols-lg-2 mb-8 overlap-section"  data-anime='{"el": "childs", "translateY": [30, 0], "perspective": [1200,1200], "scale": [1.05, 1], "rotateX": [30, 0], "opacity": [0,1], "duration": 800, "delay": 200, "staggervalue": 300, "easing": "easeOutQuad" }'>
                    ${bannerItems}
                </div>
                <div class="row justify-content-center align-items-center mb-5 sm-mb-30px">
                    <div class="col-auto pe-25px border-2 border-end border-color-dark-gray sm-border-end-0 sm-pe-15px">
                        <span class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px">${headerText}</span>
                    </div>
                    <div class="col-12 col-md-auto ps-25px sm-ps-15px text-center">
                        <h3 class="alt-font fw-400 text-dark-gray ls-minus-1px mb-0">${headerSubText}</h3>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-lg-4 row-cols-md-4 clients-style-04" data-anime='{"opacity": [0,1], "duration": 400, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'>
                    ${clientItems}
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// ProjectShowcaseSection
	//////////////////

	/*
   Usage
   /*

   {% ProjectShowcaseSection {
    projects: [
        {
            imageUrl: "https://via.placeholder.com/500x300",
            category: "Digital",
            title: "Pixflow",
            description: "A comprehensive digital platform",
            link: "#project1"
        },
        {
            imageUrl: "https://via.placeholder.com/500x300",
            category: "Branding",
            title: "Herbal",
            description: "Branding for natural wellness products",
            link: "#project2"
        },
        // Add more projects as needed
    ],
    tabs: [
        { filter: "*", title: "All" },
        { filter: ".digital", title: "Digital" },
        { filter: ".branding", title: "Branding" },
        // Add more tabs as needed
    ]
   } %}
*/

	eleventyConfig.addShortcode(
		"ProjectShowcaseSection",
		function ({ projects, tabs }) {
			const tabItems = tabs
				.map(
					(tab) => `
        <li class="nav"><a data-filter="${tab.filter}" href="#">${tab.title}</a></li>
    `
				)
				.join("");

			const projectItems = projects
				.map(
					(project) => `
        <li class="grid-item ${project.category.toLowerCase()} transition-inner-all" style="position: absolute;">
            <a href="${project.link}">
                <div class="portfolio-box">
                    <div class="portfolio-image border-radius-6px">
                        <img src="${project.imageUrl}" alt="" data-no-retina="">
                    </div>
                    <div class="portfolio-hover box-shadow-extra-large">
                        <div class="bg-white d-flex align-items-center align-self-end text-start border-radius-4px ps-30px pe-30px pt-20px pb-20px lg-p-20px w-100">
                            <div class="me-auto">
                                <div class="fs-12 fw-500 text-medium-gray text-uppercase lh-24">${
																	project.category
																}</div>
                                <div class="fw-700 text-dark-gray text-uppercase lh-initial">${
																	project.title
																}</div>
                            </div>
                            <div class="ms-auto"><i class="feather icon-feather-plus icon-extra-medium text-dark-gray lh-36"></i></div>
                        </div>
                    </div>
                </div>
            </a>
        </li>
    `
				)
				.join("");

			return `
        <section class="position-relative">
            <div class="container">
                <div class="row align-items-center mb-4" data-anime='{ "el": "childs", "translateY": [30, 1], "opacity": [0,1], "duration": 600, "delay": 0, "staggervalue":200, "easing": "easeOutQuad" }'>
                    <div class="col-xl-5 lg-mb-30px text-center text-xl-start">
                        <h3 class="text-dark-gray fw-700 mb-0 ls-minus-2px">Recent case studies</h3>
                    </div>
                    <div class="col-xl-7 tab-style-04 text-center text-xl-end">
                        <ul class="portfolio-filter nav nav-tabs justify-content-center justify-content-xl-end border-0 fw-500">
                            ${tabItems}
                        </ul>
                    </div>
                </div>
                <div class="row" data-anime='{ "el": "childs", "translateY": [20, 0], "opacity": [0,1], "duration": 600, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'>
                    <div class="col-12 filter-content p-md-0">
                        <ul class="portfolio-modern portfolio-wrapper grid grid-3col xxl-grid-3col xl-grid-3col lg-grid-3col md-grid-2col sm-grid-2col xs-grid-1col gutter-extra-large">
                            <li class="grid-sizer"></li>
                            ${projectItems}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);







    ///////////////////
// RevolvingSolutionsSection
///////////////////

/*
   Usage:

   {% RevolvingSolutionsSection {
    backgroundImageUrl: "url('https://via.placeholder.com/1920x1080')",
    videoUrl: "https://www.youtube.com/watch?v=cfXHhfNy7tU",
    rotationWords: ["business!", "problems!", "brands!"],
    contactUrl: "demo-corporate-contact.html"
   } %}
*/

eleventyConfig.addShortcode(
    "RevolvingSolutionsSection",
    function ({ backgroundImageUrl, videoUrl, rotationWords, contactUrl }) {
        const rotationWordsMarkup = rotationWords.map(word =>
            `<span class="word">${word.split('').map(char => `<span class="char">${char}</span>`).join('')}</span>`
        ).join('');

        return `
        <section class="p-0">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12">
                        <div class="border-radius-6px h-450px md-h-350px sm-h-400px d-flex flex-wrap align-items-center justify-content-center overflow-hidden cover-background box-shadow-quadruple-large pt-15" style="background-image: ${backgroundImageUrl}">
                            <div class="opacity-full-dark bg-gradient-regal-blue-transparent"></div>
                            <div class="row justify-content-center m-0">
                                <div class="col-lg-7 col-md-8 z-index-1 text-center text-md-start sm-mb-20px">
                                    <h3 class="text-white mb-0 fw-400 fancy-text-style-4">We make the creative solutions for <span class="fw-600 " data-splitting>
                                        ${rotationWordsMarkup}
                                    </span></h3>
                                    <script>
                                    Splitting();
                                    </script>
                                </div>
                                <div class="col-md-2 position-relative z-index-1 text-center sm-mb-20px">
                                    <a href="${videoUrl}" class="position-relative d-inline-block text-center border border-2 border-color-white rounded-circle video-icon-box video-icon-large popup-youtube">
                                        <span><span class="video-icon"><i class="fa-solid fa-play fs-20 text-white"></i></span></span>
                                    </a>
                                </div>
                            </div>
                            <div class="w-100 text-center position-relative mt-auto pt-20px pb-25px ps-15px pe-15px border-top border-color-transparent-white-light">
                                <div class="fs-14 text-uppercase text-white fw-600 ls-05px">Let's make something great work together. <a href="${contactUrl}" class="text-decoration-line-bottom text-white">Got a project in mind?</a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    }
);









	///////////////////
	// AdvancedStatsSection
	//////////////////

	/*
   Usage
   /*
   {% AdvancedStatsSection {
    title: "In providing corporate finance and business statistics advice.",
    leftPercentage: 96,
    rightPercentage: 98,
    leftText: "Prefer cloud accounting",
    rightText: "Most outsourced tasks",
    description1: "Lorem ipsum simply dummy text printing type setting.",
    description2: "Lorem ipsum simply dummy text printing type setting."
   } %}
*/

	eleventyConfig.addShortcode(
		"AdvancedStatsSection",
		function ({
			title,
			leftPercentage,
			rightPercentage,
			leftText,
			rightText,
			description1,
			description2,
		}) {
			return `
        <section class="pb-4 sm-pb-50px">
            <div class="container">
                <div class="row">
                    <div class="col-lg-5 md-mb-35px text-center text-lg-start">
                        <h3 class="fw-700 mb-0 text-dark-gray ls-minus-2px sm-ls-minus-1px appear words lines splitting anime-child anime-complete" data-anime="{ "el": "lines", "translateY": [30, 0], "opacity": [0,1], "delay": 0, "staggervalue": 250, "easing": "easeOutQuad" }" style="--word-total: 8; --line-total: 3;"><span class="d-inline" style="will-change: inherit;">${title}</span></h3>
                    </div>
                    <div class="col-xl-6 col-lg-7 offset-xl-1 text-center text-lg-start">
                        <div class="row align-items-center">
                            <div class="col-sm-6 last-paragraph-no-margin counter-style-04 xs-mb-35px">
                                <h2 class="vertical-counter d-inline-flex alt-font text-dark-gray fw-700 ls-minus-2px xs-ls-minus-1px mb-5px appear" data-text="%" data-to="${leftPercentage}" style="height: 41.25px;"><sup class="text-emerald-green top-minus-5px"><i class="bi bi-arrow-up icon-medium"></i></sup><span class="vertical-counter-number" data-to="${
				leftPercentage.toString()[0]
			}"><ul style="transform: translateY(-${
				leftPercentage.toString()[0] * 10
			}%);"><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li></ul></span><span class="vertical-counter-number" data-to="${
				leftPercentage.toString()[1]
			}"><ul style="transform: translateY(-${
				leftPercentage.toString()[1] * 10
			}%);"><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li></ul></span></h2>
                                <span class="fs-19 fw-600 ls-minus-05px mb-5px d-block text-dark-gray appear words lines splitting anime-child anime-complete" data-anime="{ "el": "lines", "translateY": [30, 0], "opacity": [0,1], "delay": 0, "staggervalue": 250, "easing": "easeOutQuad" }" style="--word-total: 3; --line-total: 1;"><span class="d-inline" style="will-change: inherit;">${leftText}</span></span>
                                <p class="w-90 sm-w-100 md-mx-auto appear words lines splitting anime-child anime-complete" data-anime="{ "el": "lines", "translateY": [30, 0], "opacity": [0,1], "delay": 100, "staggervalue": 250, "easing": "easeOutQuad" }" style="--word-total: 8; --line-total: 2;"><span class="d-inline" style="will-change: inherit;">${description1}</span></p>
                            </div>
                            <div class="col-sm-6 last-paragraph-no-margin counter-style-04">
                                <h2 class="vertical-counter d-inline-flex alt-font text-dark-gray fw-700 ls-minus-2px xs-ls-minus-1px mb-5px appear" data-text="%" data-to="${rightPercentage}" style="height: 41.25px;"><sup class="text-emerald-green top-minus-5px"><i class="bi bi-arrow-up icon-medium"></i></sup><span class="vertical-counter-number" data-to="${
				rightPercentage.toString()[0]
			}"><ul style="transform: translateY(-${
				rightPercentage.toString()[0] * 10
			}%);"><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li></ul></span><span class="vertical-counter-number" data-to="${
				rightPercentage.toString()[1]
			}"><ul style="transform: translateY(-${
				rightPercentage.toString()[1] * 10
			}%);"><li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li><li>9</li></ul></span></h2>
                                <span class="fs-19 fw-600 ls-minus-05px mb-5px d-block text-dark-gray appear words lines splitting anime-child anime-complete" data-anime="{ "el": "lines", "translateY": [30, 0], "opacity": [0,1], "delay": 0, "staggervalue": 250, "easing": "easeOutQuad" }" style="--word-total: 3; --line-total: 1;"><span class="d-inline" style="will-change: inherit;">${rightText}</span></span>
                                <p class="w-90 sm-w-100 md-mx-auto appear words lines splitting anime-child anime-complete" data-anime="{ "el": "lines", "translateY": [30, 0], "opacity": [0,1], "delay": 100, "staggervalue": 250, "easing": "easeOutQuad" }" style="--word-total: 8; --line-total: 2;"><span class="d-inline" style="will-change: inherit;">${description2}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// DynamicTabSection
	//////////////////

	/*
   Usage
   /*
   {% DynamicTabSection {
       tabs: [
           {
               title: "Premium cottage",
               imageUrl: "https://via.placeholder.com/600x400",
               price: "$50.00",
               description: "Discover a private home in the orchard...",
               bookingUrl: "demo-hotel-and-resort-contact.html",
               features: [
                   { icon: "fa-bathrobe", text: "Laundry facilities" },
                   { icon: "fa-french-fries", text: "Breakfast included" },
                   { icon: "fa-car", text: "Pickup and drop" }
               ]
           },
           {
               title: "Studios with terrace",
               imageUrl: "https://via.placeholder.com/600x400",
               price: "$70.00",
               description: "Enjoy the luxury of space...",
               bookingUrl: "demo-hotel-and-resort-contact.html",
               features: [
                   { icon: "fa-bathrobe", text: "Laundry facilities" },
                   { icon: "fa-french-fries", text: "Breakfast included" },
                   { icon: "fa-car", text: "Pickup and drop" }
               ]
           }
       ]
   } %}
*/

	eleventyConfig.addShortcode("DynamicTabSection", function ({ tabs }) {
		const tabLinks = tabs
			.map(
				(tab, index) => `
        <li class="nav-item" role="presentation">
            <a class="${
							index === 0 ? "nav-link active" : "nav-link"
						}" data-bs-toggle="tab" href="#tab_seven${
					index + 1
				}" aria-selected="${index === 0 ? "true" : "false"}" role="tab">
                <span><span class="primary-font me-10px fs-18 fw-800">${
									index + 1
								}</span>${tab.title}</span>
                <span class="number-box d-flex justify-content-center align-items-center rounded-circle h-70px w-70px bg-base-color text-white"><i class="bi bi-arrow-right icon-extra-medium"></i></span>
                <span class="bg-hover bg-base-color"></span>
            </a>
        </li>
    `
			)
			.join("");

		const tabContent = tabs
			.map(
				(tab, index) => `
        <div class="tab-pane fade ${
					index === 0 ? "in h-100 active show" : "in h-100"
				}" id="tab_seven${index + 1}" role="tabpanel">
            <div class="row g-0 h-100 lg-h-auto">
                <div class="col-xl-6">
                    <div class="h-100 lg-h-400px cover-background position-relative" style="background-image: url(${
											tab.imageUrl
										})">
                        <div class="position-absolute right-0px bottom-0 d-flex">
                            <div class="ps-40px pe-40px h-110px bg-white d-flex align-items-center">
                                <div class="fs-30 fw-700 text-dark-gray"><span class="fs-16 fw-500 d-table lh-22 text-medium-gray">Starting from</span>${
																	tab.price
																}</div>
                            </div>
                            <div class="ps-40px pe-40px xs-ps-30px xs-pe-30px h-110px bg-dark-gray d-flex align-items-center">
                                <a href="${
																	tab.bookingUrl
																}" class="d-flex align-items-center text-white">
                                    <span class="fs-18 fw-800 lh-22 text-uppercase me-15px">Book<br>now</span>
                                    <span class="w-55px h-55px bg-white-transparent-extra-light border-radius-100 text-white position-relative"><i class="bi bi-arrow-right-short icon-extra-medium absolute-middle-center lh-0px"></i></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-6 bg-very-light-gray pt-6 pb-6 ps-8 pe-8">
                    <div class="d-flex align-items-xl-start align-items-center text-center text-xl-start flex-column justify-content-center h-100">
                        <span class="text-base-color fw-500">${tab.title}</span>
                        <h3 class="text-dark-gray mb-15px alt-font">${
													tab.title
												}</h3>
                        <p>${tab.description}</p>
                        <div class="row row-cols-1 row-cols-lg-3 row-cols-sm-3 justify-content-center mt-25px md-mt-15px g-0 w-100">
                            ${tab.features
															.map(
																(feature) => `
                                <div class="col icon-with-text-style-03">
                                    <div class="feature-box ps-25px pe-25px xl-ps-15px xl-pe-15px xs-mb-30px overflow-hidden border-end xs-border-end-0 border-color-transparent-base-color">
                                        <div class="feature-box-icon">
                                            <i class="line-icon-${feature.icon} icon-large text-base-color mb-15px"></i>
                                        </div>
                                        <div class="feature-box-content last-paragraph-no-margin">
                                            <span class="d-inline-block text-dark-gray fw-800 fs-14 text-uppercase lh-20">${feature.text}</span>
                                        </div>
                                    </div>
                                </div>
                            `
															)
															.join("")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
			)
			.join("");

		return `
        <section class="p-0 overflow-hidden">
            <div class="container-fluid p-0">
                <div class="row g-0 bg-very-light-gray">
                    <div class="col-xl-3 col-lg-4 col-md-5 tab-style-07 d-flex align-items-start align-items-xl-center">
                        <ul class="nav nav-tabs justify-content-center border-0 text-left fs-24 alt-font" role="tablist">
                            ${tabLinks}
                        </ul>
                    </div>
                    <div class="col-xl-9 col-lg-8 col-md-7">
                        <div class="tab-content h-100">
                            ${tabContent}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// TabsContentShowcase
	//////////////////

	/*
   Usage
   /*
   {% TabsContentShowcase {
    tabs: [
        {
            id: "tab_eight1",
            label: "Strategic planning",
            imageUrl: "https://via.placeholder.com/500",
            counter: "85",
            description: "Organization's process of defining strategy.",
            link: "demo-accounting-services.html"
        },
        {
            id: "tab_eight2",
            label: "Audit assurance",
            imageUrl: "https://via.placeholder.com/500",
            counter: "80",
            description: "An excellent audit service for company.",
            link: "demo-accounting-services.html"
        },
        {
            id: "tab_eight3",
            label: "Financial projections",
            imageUrl: "https://via.placeholder.com/500",
            counter: "85",
            description: "We are leader in tax advisor and financial.",
            link: "demo-accounting-services.html"
        },
        {
            id: "tab_eight4",
            label: "Business planning",
            imageUrl: "https://via.placeholder.com/500",
            counter: "80",
            description: "We creating specific business strategies.",
            link: "demo-accounting-services.html"
        }
    ]
   } %}
*/

	eleventyConfig.addShortcode("TabsContentShowcase", function ({ tabs }) {
		const tabNavs = tabs
			.map(
				(tab) => `
        <li class="nav-item" role="presentation"><a data-bs-toggle="tab" href="#${tab.id}" class="nav-link" aria-selected="${tab.isActive}" role="tab">${tab.label}<span class="tab-border bg-base-color"></span></a></li>
    `
			)
			.join("");

		const tabContents = tabs
			.map(
				(tab) => `
        <div class="tab-pane fade ${tab.isActive ? "show active" : ""}" id="${
					tab.id
				}" role="tabpanel">
            <div class="row align-items-center justify-content-center g-lg-0">
                <div class="col-md-6 sm-mb-30px position-relative overflow-hidden">
                    <img src="${
											tab.imageUrl
										}" alt="" class="w-100 border-radius-6px" data-no-retina="">
                    <div class="bg-very-light-gray w-250px position-absolute pt-20px pb-20px ps-25px pe-25px border-radius-4px bottom-30px left-35px box-shadow-large">
                        <h2 class="vertical-counter d-inline-flex text-dark-gray fw-700 ls-minus-2px md-ls-minus-1px mb-0 text-nowrap border-end border-1 border-color-transparent-dark-very-light pe-20px me-20px" data-to="${
													tab.counter
												}">
                            <span class="vertical-counter-number">${tab.counter.substring(
															0,
															1
														)}</span>
                            <span class="vertical-counter-number">${tab.counter.substring(
															1
														)}</span>
                        </h2>
                        <span class="text-dark-gray ls-minus-05px d-inline-block lh-22">Project completed</span>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-5 offset-lg-1 col-md-6 text-center text-md-start">
                    <div class="mb-20px">
                        <div class="separator-line-1px w-50px bg-base-color d-inline-block align-middle me-10px opacity-2"></div>
                        <span class="d-inline-block text-dark-gray align-middle fw-500 fs-20 ls-minus-05px">${
													tab.description
												}</span>
                    </div>
                    <p class="mb-35px md-mb-25px">We provide simplified accounting solutions and qualitative business process services to the customers which helps streamline your business and give your company a competitive.</p>
                    <a href="${
											tab.link
										}" class="btn btn-large btn-rounded with-rounded btn-white btn-box-shadow fw-600">Learn more<span class="bg-base-color text-white"><i class="bi bi-arrow-right-short icon-extra-medium"></i></span></a>
                </div>
            </div>
        </div>
    `
			)
			.join("");

		return `
        <section class="bg-very-light-gray pb-0" id="services">
            <div class="container">
                <div class="row mb-8 sm-mb-10">
                    <div class="col-12 tab-style-08">
                        <div class="tab-content">
                            ${tabContents}
                        </div>
                        <div class="tab-style-08 border-bottom border-color-extra-medium-gray bg-white box-shadow-quadruple-large">
                            <div class="container">
                                <ul class="nav nav-tabs border-0 fw-500 fs-19 text-center" role="tablist">
                                    ${tabNavs}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// LargeSizeCategoriesShowcaseSection
	//////////////////

	/*
   Usage
   /*
   {% LargeSizeCategoriesShowcaseSection {
    categories: [
        {
            imageUrl: "https://via.placeholder.com/500",
            itemsCount: 8,
            label: "Women",
            link: "demo-fashion-store-shop.html"
        },
        {
            imageUrl: "https://via.placeholder.com/500",
            itemsCount: 9,
            label: "Men",
            link: "demo-fashion-store-shop.html"
        },
        {
            imageUrl: "https://via.placeholder.com/500",
            itemsCount: 8,
            label: "Accessories",
            link: "demo-fashion-store-shop.html"
        },
        {
            imageUrl: "https://via.placeholder.com/500",
            itemsCount: 8,
            label: "Kids",
            link: "demo-fashion-store-shop.html"
        }
    ]
   } %}
*/

	eleventyConfig.addShortcode(
		"LargeSizeCategoriesShowcaseSection",
		function ({ categories }) {
			const categoryItems = categories
				.map(
					(category) => `
        <div class="col categories-style-02 lg-mb-30px">
            <div class="categories-box">
                <a href="${category.link}">
                    <img class="sm-w-100" src="${category.imageUrl}" alt="" data-no-retina="">
                </a>
                <div class="border-color-transparent-dark-very-light border alt-font fw-500 text-dark-gray text-uppercase ps-15px pe-15px fs-11 lh-26 border-radius-100px d-inline-block position-absolute right-20px top-20px">${category.itemsCount} items</div>
                <div class="absolute-bottom-center bottom-40px md-bottom-25px">
                    <a href="${category.link}" class="btn btn-white btn-switch-text btn-round-edge btn-box-shadow fs-18 text-uppercase-inherit p-5 min-w-150px">
                        <span>
                            <span class="btn-double-text ls-0px" data-text="${category.label}">${category.label}</span>
                        </span>
                    </a>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="pt-0 pb-0 ps-7 pe-7 lg-ps-3 lg-pe-3 xs-p-0">
            <div class="container-fluid">
                <div class="row row-cols-1 row-cols-xl-4 row-cols-lg-2 row-cols-md-2" data-anime='{ "el": "childs", "translateY": [20, 0], "opacity": [0,1], "duration": 600, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'>
                    ${categoryItems}
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// ProductsShowcase
	//////////////////

	/*
   Usage:
   {% ProductsShowcase {
    products: [
        {
            imageUrl: "https://via.placeholder.com/600x765",
            label: "New",
            productUrl: "demo-fashion-store-single-product.html",
            title: "Textured sweater",
            originalPrice: "$200.00",
            salePrice: "$189.00"
        },
        {
            imageUrl: "https://via.placeholder.com/600x765",
            productUrl: "demo-fashion-store-single-product.html",
            title: "Traveller shirt",
            originalPrice: "$350.00",
            salePrice: "$289.00"
        }
    ]
   } %}
*/

	eleventyConfig.addShortcode("ProductsShowcase", function ({ products }) {
		const productItems = products
			.map(
				(product) => `
        <li class="grid-item" style="position: absolute; left: ${
					product.position || 0
				}%; top: 0px; transition-behavior: normal; transition-timing-function: ease;">
            <div class="shop-box mb-10px">
                <div class="shop-image mb-20px">
                    <a href="${product.productUrl}">
                        <img src="${product.imageUrl}" alt="${
					product.title
				}" data-no-retina="">
                        ${
													product.label
														? `<span  class="label new alt-font fw-800 btn-white btn-round-edge position-absolute left-20px top-20px">${product.label}</span>`
														: ""
												}
                    </a>
                </div>
                <div class="shop-footer text-center">
                    <a href="${
											product.productUrl
										}" class="alt-font text-dark-gray fs-19 fw-500">${
					product.title
				}</a>
                    <div class="price lh-22 fs-16"><del>${
											product.originalPrice
										}</del> ${product.salePrice}</div>
                </div>
            </div>
        </li>
    `
			)
			.join("");

		return `
        <section class="ps-7 pe-7 pb-3 lg-ps-3 lg-pe-3 sm-pb-6 xs-px-0">
            <div class="container">
                <div class="row mb-5 xs-mb-8">
                    <div class="col-12 text-center">
                        <h2 class="alt-font text-dark-gray mb-0 ls-minus-2px">Best seller <span class="text-highlight fw-600">products<span class="bg-base-color h-5px bottom-2px"></span></span></h2>
                    </div>
                </div>
            </div>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <ul class="shop-modern shop-wrapper grid grid-5col lg-grid-4col md-grid-3col sm-grid-2col xs-grid-1col gutter-extra-large text-center" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [-15, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 300, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 100, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="position: relative; height: 1283.72px;">
                            <li class="grid-sizer"></li>
                            ${productItems}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// DynamicSwiperSlider
	//////////////////

	/*
   Usage
   /*
   {% DynamicSwiperSlider {
    slides: [
        {
            imageUrl: "https://via.placeholder.com/1920x1060",
            label: "Discount on selected collection!",
            title: "Women's",
            subtitle: "collection",
            link: "demo-fashion-store-shop.html"
        },
        {
            imageUrl: "https://via.placeholder.com/1920x1060",
            label: "Discount on selected collection!",
            title: "Men's",
            subtitle: "collection",
            link: "demo-fashion-store-shop.html"
        },
        {
            imageUrl: "https://via.placeholder.com/1920x1060",
            label: "Discount on selected collection!",
            title: "Children's",
            subtitle: "collection",
            link: "demo-fashion-store-shop.html"
        }
    ]
   } %}
*/

	eleventyConfig.addShortcode("DynamicSwiperSlider", function ({ slides }) {
		const slideItems = slides
			.map(
				(slide, index) => `
        <div class="swiper-slide overflow-hidden ${
					index === 0
						? "swiper-slide-visible swiper-slide-fully-visible swiper-slide-active"
						: index === 1
						? "swiper-slide-next"
						: "swiper-slide-prev"
				}" role="group" aria-label="${index + 1} / ${
					slides.length
				}" data-swiper-slide-index="${index}" style="width: 851px;">
            <div class="cover-background position-absolute top-0 start-0 w-100 h-100" data-swiper-parallax="500" style="background-image: url('${
							slide.imageUrl
						}');">
                <div class="container h-100">
                    <div class="row align-items-center h-100 justify-content-start">
                        <div class="col-md-10 position-relative text-white d-flex flex-column justify-content-center h-100">
                            <div data-anime="{ 'opacity': [0, 1], 'translateY': [50, 0], 'easing': 'easeOutQuad', 'duration': 500, 'delay': 300 }" class="alt-font text-dark-gray mb-25px fs-20 sm-mb-15px"><span class="text-highlight">${
															slide.label
														}<span class="bg-base-color h-8px bottom-0px"></span></span></div>
                            <div class="alt-font fs-120 xs-fs-95 lh-100 mb-40px text-dark-gray fw-600 transform-origin-right ls-minus-5px sm-mb-25px" data-anime="{ 'el': 'childs', 'rotateX': [90, 0], 'opacity': [0,1], 'staggervalue': 150, 'easing': 'easeOutQuad' }">
                                <span class="d-block">${slide.title}</span>
                                <span class="d-block fw-300">${
																	slide.subtitle
																}</span>
                            </div>
                            <div data-anime="{ 'opacity': [0, 1], 'translateY': [100, 0], 'easing': 'easeOutQuad', 'duration': 800, 'delay': 400 }">
                                <a href="${
																	slide.link
																}" class="btn btn-dark-gray btn-box-shadow btn-large">View collection</a>
                            </div> 
                        </div>
                    </div> 
                </div>
            </div>
        </div>
    `
			)
			.join("");

		return `
        <section class="p-0">
            <div class="swiper full-screen top-space-margin md-h-600px sm-h-500px magic-cursor magic-cursor-vertical swiper-number-pagination-progress swiper-number-pagination-progress-vertical swiper-initialized swiper-horizontal swiper-watch-progress swiper-backface-hidden" data-slider-options="{ 'slidesPerView': 1, 'direction': 'horizontal', 'loop': true, 'parallax': true, 'speed': 1000, 'pagination': { 'el': '.swiper-number', 'clickable': true }, 'autoplay': { 'delay': 4000, 'disableOnInteraction': false },  'keyboard': { 'enabled': true, 'onlyInViewport': true }, 'breakpoints': { '1199': { 'direction': 'vertical' }}, 'effect': 'slide' }" data-swiper-number-pagination-progress="true">
                <div class="swiper-wrapper" id="swiper-wrapper-524464f925b8c9f2" aria-live="off">
                    ${slideItems}
                </div>
                <div class="swiper-pagination-wrapper">
                    <div class="pagination-progress-vertical d-flex align-items-center justify-content-center">
                        <div class="number-prev text-dark-gray fs-16 fw-500">01</div>
                        <div class="swiper-pagination-progress" style="--swiper-progress: 33.33%;">
                            <span class="swiper-progress"></span>
                        </div>
                        <div class="number-next text-dark-gray fs-16 fw-500">03</div>    
                    </div>
                </div>
                <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
            </div>
        </section>
    `;
	});

	///////////////////
	// CustomCounterSection
	//////////////////

	/*
   Usage:
   /*
   {% CustomCounterSection {
    counters: [
      {
        number: 4586,
        title: "Telephonic talk",
        background: "https://via.placeholder.com/150",
        highlightColor: "gradient-flamingo-amethyst-green"
      }
    ]
   } %}
*/

	eleventyConfig.addShortcode("CustomCounterSection", function ({ counters }) {
		let counterHtml = counters
			.map(
				(counter) => `
        <div class="col text-center sm-mb-30px">
            <h2 class="vertical-counter d-inline-flex text-dark-gray fw-800 mb-0 ls-minus-3px position-relative z-index-0 appear" style="height: 50px;">
                <span class="text-highlight position-absolute bottom-9px w-100">
                    <span class="bg-${
											counter.highlightColor
										} h-10px opacity-2"></span>
                </span>
                <span class="vertical-counter-number" data-to="${counter.number
									.toString()
									.substring(0, 1)}">
                    <ul style="transform: translateY(-${
											parseInt(counter.number.toString().substring(0, 1)) * 10
										}%);">
                        ${[...Array(10).keys()]
													.map((n) => `<li>${n}</li>`)
													.join("")}
                    </ul>
                </span>
                ${counter.number
									.toString()
									.substring(1)
									.split("")
									.map(
										(digit, index) => `
                    <span class="vertical-counter-number" data-to="${digit}">
                        <ul style="transform: translateY(-${digit * 10}%);">
                            ${[...Array(10).keys()]
															.map((n) => `<li>${n}</li>`)
															.join("")}
                        </ul>
                    </span>
                `
									)
									.join("")}
            </h2>
            <span class="d-block fs-14 fw-700 text-uppercase text-dark-gray">${
							counter.title
						}</span>
        </div>
    `
			)
			.join("");

		return `
        <div class="row row-cols-1 row-cols-md-4 row-cols-sm-2 justify-content-center counter-style-07 ps-3 pe-3">
            ${counterHtml}
        </div>
    `;
	});

	///////////////////
	// CustomContentSection
	//////////////////

	/*
   Usage
   /*
   {% CustomContentSection {
    leftImage: "https://via.placeholder.com/600x400",
    rightImage: "https://via.placeholder.com/50x50",
    rating: "4.8",
    reviewCount: "2488",
    reviewType: "Excellent score",
    sectionTitle: "Frequently asked questions",
    question: "What is tax and legal advisory?",
    answer: "The focus of the tax and legal department is on advisory services in the tax law."
   } %}
*/

	eleventyConfig.addShortcode(
		"CustomContentSection",
		function ({
			leftImage,
			rightImage,
			rating,
			reviewCount,
			reviewType,
			sectionTitle,
			question,
			answer,
		}) {
			return `
        <section>
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-6 md-mb-50px" data-anime="{ "effect": "slide", "color": "#005153", "direction":"rl", "easing": "easeOutQuad", "delay":50}" style="position: relative;">
                        <figure class="position-relative m-0 md-w-90" style="opacity: 1;">
                            <img src="${leftImage}" class="w-90 border-radius-6px" alt="" data-no-retina="">
                            <figcaption class="position-absolute bg-dark-gray border-radius-8px box-shadow-quadruple-large bottom-100px xs-bottom-minus-20px right-minus-30px w-230px xs-w-210px text-center last-paragraph-no-margin">
                                <div class="bg-white pt-35px pb-35px border-radius-6px mb-10px">
                                    <h1 class="fw-700 ls-minus-2px text-dark-gray mb-0">${rating}</h1>
                                    <div class="text-golden-yellow fs-18 ls-1px mb-5px">
                                        <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                                    </div>
                                    <span class="text-dark-gray d-block fw-600 ls-minus-05px">${reviewCount} Reviews</span>
                                    <div class="d-inline-block fs-11 text-uppercase bg-green ps-20px pe-20px lh-30 fw-600 text-white border-radius-100px box-shadow-large">${reviewType}</div>
                                </div>
                                <img src="${rightImage}" class="h-30px mb-15px" alt="" data-no-retina="">
                            </figcaption>
                        </figure>
                    </div>
                    <div class="col-lg-5 offset-lg-1" data-anime="{ "el": "childs", "translateX": [50, 0], "opacity": [0,1], "duration": 1200, "delay": 0, "staggervalue": 150, "easing": "easeOutQuad" }">
                        <div class="mb-20px md-mb-15px" style="">
                            <div class="separator-line-1px w-50px bg-base-color d-inline-block align-middle me-10px opacity-2"></div>
                            <span class="d-inline-block text-dark-gray align-middle fw-500 fs-20">${sectionTitle}</span>
                        </div>
                        <h3 class="fw-700 text-dark-gray ls-minus-2px sm-ls-minus-1px w-90 lg-w-100" style="">What we can do for you and company.</h3>
                        <div class="accordion accordion-style-02 w-90 lg-w-100" id="accordion-style-02" data-active-icon="fa-chevron-up" data-inactive-icon="fa-chevron-down" style="">
                            <div class="accordion-item">
                                <div class="accordion-header border-bottom border-color-transparent-dark-very-light">
                                    <a href="#" data-bs-toggle="collapse" data-bs-target="#accordion-style-02-01" aria-expanded="false" data-bs-parent="#accordion-style-02" class="collapsed">
                                        <div class="accordion-title mb-0 position-relative text-dark-gray">
                                            <i class="fa-solid fs-15 fa-chevron-down"></i><span class="fs-19 fw-600 ls-minus-05px">${question}</span>
                                        </div>
                                    </a>
                                </div>
                                <div id="accordion-style-02-01" class="accordion-collapse collapse" data-bs-parent="#accordion-style-02" style="">
                                    <div class="accordion-body last-paragraph-no-margin border-bottom border-color-transparent-dark-very-light">
                                        <p>${answer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// DynamicInstagramFeed
	//////////////////

	/*
   Usage
   /*
{% DynamicInstagramFeed {
   images: [
       "https://via.placeholder.com/150",
       "https://via.placeholder.com/150",
       "https://via.placeholder.com/150",
       "https://via.placeholder.com/150",
       "https://via.placeholder.com/150"
   ],
   username: "crafto"
} %}

*/

	eleventyConfig.addShortcode("DynamicInstagramFeed", function (data) {
		const images = data.images;
		const username = data.username;

		if (!Array.isArray(images)) {
			console.error('DynamicInstagramFeed expects "images" to be an array.');
			images = [];
		}

		const imageElements = images
			.map(
				(image) => `
        <div class="col instafeed-grid md-mb-30px xs-mb-15px">
            <figure class="border-radius-0px">
                <a href="https://www.instagram.com/${username}" target="_blank">
                    <img src="${image}" class="insta-image" alt="" data-no-retina="">
                    <span class="insta-icon"><i class="fa-brands fa-instagram"></i></span>
                </a>
            </figure>
        </div>
    `
			)
			.join("");

		return `
    <div class = "section">
        <div class="row row-cols-3 row-cols-lg-5 row-cols-sm-3 align-items-center justify-content-center mb-4 md-mb-50px xs-mb-40px instagram-follow-api position-relative">
            ${imageElements}
            <div class="absolute-middle-center z-index-1 w-auto">
                <a href="https://www.instagram.com/${username}" target="_blank" class="btn btn-large btn-switch-text btn-white btn-rounded left-icon btn-box-shadow instagram-button">
                    <span>
                        <span><i class="fa-brands fa-instagram text-base-color"></i></span>
                        <span class="btn-double-text" data-text="Follow ${username}">Follow ${username}</span>
                    </span>
                </a>
            </div>
        </div>
        </div>
    `;
	});

	///////////////////
	// DynamicDataAnalyticsSection
	//////////////////

	/*
   Usage
   /*
   {% DynamicDataAnalyticsSection {
    backgroundImgUrl: "https://via.placeholder.com/1920x1080",
    analysisImgUrl: "https://via.placeholder.com/800x600",
    pricing: [
        {
            planName: "Standard plan",
            description: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.",
            price: "$29.99",
            pricePeriod: "/ Monthly",
            linkUrl: "link/to/standard/plan"
        },
        {
            planName: "Premium plan",
            description: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.",
            price: "$39.99",
            pricePeriod: "/ Monthly",
            linkUrl: "link/to/premium/plan"
        }
    ]
   } %}
*/

	eleventyConfig.addShortcode(
		"DynamicDataAnalyticsSection",
		function ({ backgroundImgUrl, analysisImgUrl, pricing }) {
			const pricingItems = pricing
				.map(
					(item) => `
        <div class="accordion-item bg-white box-shadow-quadruple-large mb-25px">
            <div class="accordion-header">
                <a href="#" data-bs-toggle="collapse" data-bs-target="#accordion-${item.planName.replace(
									/\s/g,
									"-"
								)}" aria-expanded="false" data-bs-parent="#accordion-style-01" class="collapsed">
                    <div class="accordion-title position-relative d-flex align-items-center pe-20px mb-0 text-dark-gray fw-600 fs-20 alt-font ls-05px">${
											item.planName
										}<span class="icon-round bg-extra-medium-gray text-dark-gray w-25px h-25px"><i class="fa-solid fa-angle-down"></i></span></div>
                </a>
            </div>
            <div id="accordion-${item.planName.replace(
							/\s/g,
							"-"
						)}" class="accordion-collapse collapse" data-bs-parent="#accordion-style-01">
                <div class="accordion-body last-paragraph-no-margin">
                    <p class="opacity-4 alt-font ls-05px w-80 xl-w-90">${
											item.description
										}</p>
                    <div class="d-sm-flex align-items-end mt-25px">
                        <h5 class="text-white mb-0 alt-font ls-05px fw-500 xs-mb-20px">${
													item.price
												} <span class="fs-17 opacity-4 fw-400">${
						item.pricePeriod
					}</span></h5>
                        <a href="${
													item.linkUrl
												}" class="btn btn-transparent-white-light btn-round-edge btn-small border-1 ms-auto fw-500">Get started</a>
                    </div>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="p-0 position-relative">
            <img src="${backgroundImgUrl}" class="position-absolute top-50px left-0px lg-w-50" data-bottom-top="transform: translateY(150px)" data-top-bottom="transform: translateY(-150px)" alt="" style="" data-no-retina="">
            <div class="container">
                <div class="row align-items-end mb-4">
                    <div class="col-xl-6 col-lg-6 animation-float text-center text-lg-start appear anime-complete" data-anime="{ &quot;translate&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="translate: 0px;">
                        <img src="${analysisImgUrl}" class="md-w-70 sm-w-100" data-bottom-top="transform: translateY(-50px)" data-top-bottom="transform: translateY(50px)" alt="" style="" data-no-retina="">
                    </div>
                    <div class="col-xl-5 col-lg-6 offset-xl-1 appear anime-complete" data-anime="{ &quot;translate&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="translate: 0px;">
                        <div class="bg-base-color fw-600 text-white text-uppercase ps-20px pe-20px fs-12 border-radius-100px d-inline-block mb-20px">Flexible pricing</div>
                        <h2 class="fw-700 alt-font text-dark-gray ls-minus-1px mb-50px sm-mb-35px">Tailored <span class="text-highlight">pricing<span class="bg-base-color opacity-3 h-10px bottom-10px"></span></span> plans for everyone.</h2>
                        <div class="accordion pricing-table-style-04 mb-50px" id="accordion-style-01" data-active-icon="fa-angle-up" data-inactive-icon="fa-angle-down">
                            ${pricingItems}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// DynamicCreativeSolutionsSection
	//////////////////

	/*
   Usage
   /*
   {% DynamicCreativeSolutionsSection {
    backgroundImage: "path/to/background/image.jpg",
    buttonLink: "link/to/project"
   } %}
*/

	eleventyConfig.addShortcode(
		"DynamicCreativeSolutionsSection",
		function ({ backgroundImage, buttonLink }) {
			return `
        <section class="cover-background one-third-screen sm-h-500px pb-0 position-relative" style="background-image:url('${backgroundImage}');">
            <div class="opacity-extra-medium bg-dark-gray"></div>
            <div class="container h-100">
                <div class="row align-items-center justify-content-center h-100">
                    <div class="col-xl-8 col-lg-10 mb-9 md-mb-15 position-relative z-index-1 text-center d-flex flex-wrap align-items-center justify-content-center appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [50, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                        <span class="ps-25px pe-25px pt-5px pb-5px mb-25px text-uppercase text-white fs-12 ls-1px fw-600 border-radius-100px bg-gradient-dark-gray-transparent d-inline-flex align-items-center text-start sm-lh-20" style=""><i class="bi bi-megaphone text-white d-inline-block align-middle icon-small me-10px"></i> Let's make something great work together.</span>
                        <h1 class="text-white fw-600 ls-minus-2px mb-50px" style="">We make the creative solutions for business!</h1>
                        <a href="${buttonLink}" class="btn btn-extra-large btn-switch-text btn-gradient-purple-pink btn-rounded me-10px" style="">
                            <span>
                                <span class="btn-double-text" data-text="Got a project in mind">Got a project in mind</span>
                                <span><i class="fa-solid fa-arrow-right"></i></span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
            <div class="shape-image-animation p-0 w-100 bottom-minus-40px xl-bottom-0px d-none d-md-block">
                <svg xmlns="http://www.w3.org/2000/svg" widht="3000" height="400" viewBox="0 180 2500 200" fill="#ffffff">
                    <path class="st1" d="M 0 250 C 1200 400 1200 50 3000 250 L 3000 550 L 0 550 L 0 250">
                        <animate attributeName="d" dur="5s" values="M 0 250 C 1200 400 1200 50 3000 250 L 3000 550 L 0 550 L 0 250;
                                                        M 0 250 C 400 50 400 400 3000 250 L 3000 550 L 0 550 L 0 250;
                                                        M 0 250 C 1200 400 1200 50 3000 250 L 3000 550 L 0 550 L 0 250" repeatCount="indefinite"></animate>
                    </path>
                </svg>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// DynamicTestimonialsSection
	//////////////////

	/*
   Usage:
   /*
   {% DynamicTestimonialsSection {
    backgroundImg: "https://via.placeholder.com/1920x1080",
    testimonials: [
        {
            imageUrl: "https://via.placeholder.com/400x400",
            logoUrl: "https://via.placeholder.com/100x35",
            text: "Their team are easy to work with and helped me make amazing websites in a short amount of time. Thanks guys for all your hard work. Trust us we looked for a very long time.",
            author: "Herman miller, Monday"
        },
        {
            imageUrl: "https://via.placeholder.com/400x400",
            logoUrl: "https://via.placeholder.com/100x35",
            text: "Their team are easy to work with and helped me make amazing websites in a short amount of time. Thanks guys for all your hard work. Trust us we looked for a very long time.",
            author: "Leonel mooney, Logitech"
        }
    ],
    stats: [
        {
            logoUrl: "https://via.placeholder.com/100x35",
            description: "Project management - 275% Growth"
        },
        {
            logoUrl: "https://via.placeholder.com/100x35",
            description: "Team management - 195% Growth"
        }
    ]
   } %}
*/

	eleventyConfig.addShortcode(
		"DynamicTestimonialsSection",
		function ({ backgroundImg, testimonials, stats }) {
			const testimonialSlides = testimonials
				.map(
					(t) => `
        <div class="swiper-slide overflow-hidden" style="width: 930px;">
            <div class="row align-items-center justify-content-center">
                <div class="col-8 col-md-4 col-sm-6 text-center md-mb-30px">
                    <img src="${t.imageUrl}" alt="" style="width: 400px; height: 400px;" data-no-retina>
                </div>
                <div class="col-lg-5 col-md-7 last-paragraph-no-margin text-center text-md-start">
                    <a href="#" class="mb-15px d-block"><img src="${t.logoUrl}" alt="" style="height: 35px;" data-no-retina></a>
                    <span class="mb-5px d-table fs-18 lh-30 fw-500 text-dark-gray">${t.text}</span>
                    <span class="fs-15 text-uppercase fw-800 text-dark-gray ls-05px">${t.author}</span>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			const statsItems = stats
				.map(
					(s) => `
        <div class="col sm-mb-30px">
            <div class="bg-white h-100 border-radius-6px text-center box-shadow-quadruple-large box-shadow-quadruple-large-hover">
                <div class="pt-10 pb-10">
                    <img src="${s.logoUrl}" alt="" style="height: 35px;" data-no-retina>
                </div>
                <div class="border-top fs-16 p-15px last-paragraph-no-margin">
                    <p>${s.description}</p>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="pt-0">
            <div class="container background-no-repeat background-position-top" style="background-image: url('${backgroundImg}')">
                <div class="row justify-content-center mb-2">
                    <div class="col-xxl-6 col-lg-8 col-md-9 text-center appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;:0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                        <h3 class="text-dark-gray fw-700 ls-minus-2px" style="">Trusted by the world's fastest growing companies.</h3>
                    </div>
                </div>
                <div class="row justify-content-center align-items-center mb-6 sm-mb-8">
                    <div class="col-xl-10 position-relative">
                        <div class="swiper magic-cursor testimonials-style-06 swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ &quot;loop&quot;: true, &quot;autoplay&quot;: { &quot;delay&quot;: 4000, &quot;disableOnInteraction&quot;: false }, &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.swiper-button-next-nav&quot;, &quot;prevEl&quot;: &quot;.swiper-button-previous-nav&quot;, &quot;effect&quot;: &quot;fade&quot; } }">
                            <div class="swiper-wrapper" id="swiper-wrapper-5754288fbd74a3f6" aria-live="off" style="transition-duration: 0ms; transform: translate3d(-1860px, 0px, 0px); transition-delay: 0ms;">
                                ${testimonialSlides}
                            </div>
                            <div class="swiper-button-previous-nav swiper-button-prev md-left-0px" tabindex="0" role="button" aria-label="Previous slide" aria-controls="swiper-wrapper-5754288fbd74a3f6"><i class="feather icon-feather-arrow-left icon-extra-medium text-dark-gray"></i></div>
                            <div class="swiper-button-next-nav swiper-button-next md-right-0px" tabindex="0" role="button" aria-label="Next slide" aria-controls="swiper-wrapper-5754288fbd74a3f6"><i class="feather icon-feather-arrow-right icon-extra-medium text-dark-gray"></i></div>
                            <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
                        </div>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-md-3 justify-content-center appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [0, 0], &quot;perspective&quot;: [1200,1200], &quot;scale&quot;: [1.1, 1], &quot;rotateX&quot;: [50, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 800, &quot;delay&quot;: 200, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                    ${statsItems}
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// CustomTextSection
	//////////////////

	/*
   Usage:
   /*
   {% CustomTextSection {
    text: "Drive business growth with our customized branding solutions -",
    fontSize: {
      desktop: "130",
      medium: "90",
      small: "70"
    },
    letterSpacing: {
      desktop: "-6px",
      small: "-2px"
    }
   } %}
*/

	eleventyConfig.addShortcode(
		"CustomTextSection",
		function ({ text, fontSize, letterSpacing }) {
			return `
        <div class="fs-${fontSize.desktop} md-fs-${fontSize.medium} sm-fs-${fontSize.small} alt-font text-dark-gray fw-600 ls-${letterSpacing.desktop} sm-ls-${letterSpacing.small} word-break-normal">
            ${text} <span class="ms-20px">-</span>
        </div>
    `;
		}
	);

	///////////////////
	// CustomStackSection
	//////////////////

	/*
   Usage:
   /*
   {% CustomStackSection {
    stacks: [
      {
        backgroundImage: "https://via.placeholder.com/500x300",
        hoverImage: "https://via.placeholder.com/500x300/cccccc/969696",
        socialLink: "https://www.twitter.com/",
        socialIcon: "twitter",
        memberName: "Jeremy Dupont",
        role: "Designer",
        projectTitle: "Latest projects",
        mainTitle: "Whiteline face beauty.",
        description: "Creating products with a strong identity...",
        buttonLink: "link-to-project.html",
        buttonText: "Explore project"
      },
      // Additional stacks can be added here
    ]
   } %}
*/

	eleventyConfig.addShortcode("CustomStackSection", function ({ stacks }) {
		let stackHtml = stacks
			.map(
				(stack) => `
        <div class="col team-style-10 md-ps-15px md-pe-15px md-mb-30px" style="">
            <figure class="mb-0 position-relative overflow-hidden">
                <img src="${stack.backgroundImage}" class="w-100" alt="" data-no-retina="">
                <img src="${stack.hoverImage}" class="hover-switch-image" alt="" data-no-retina="">
                <figcaption class="w-100 h-100 d-flex flex-wrap">
                    <div class="social-icon d-flex flex-column flex-shrink-1 mb-auto p-30px ms-auto">
                        <a href="${stack.socialLink}" target="_blank" class="text-white bg-dark-gray">
                            <i class="fa-brands fa-${stack.socialIcon} icon-small"></i>
                        </a>
                    </div>
                    <div class="team-member-strip w-100 mt-auto d-flex align-items-center pt-15px pb-15px ps-30px pe-30px bg-white">
                        <span class="team-member-name fw-600 alt-font text-dark-gray fs-18 ls-minus-05px">${stack.memberName}</span>
                        <span class="member-designation fs-15 lh-20 ms-auto alt-font">${stack.role}</span>
                    </div>
                </figcaption>
            </figure>
        </div>
    `
			)
			.join("");

		return `
        <section class="pb-0">
            <div class="container-fluid p-0">
                <div class="row row-cols-1 row-cols-lg-4 row-cols-sm-2 g-0 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;rotateX&quot;:[30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;:0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                    ${stackHtml}
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// SvgPathWaveAnimation
	//////////////////

	/*
   Usage:
   /*
   {% SvgPathWaveAnimation {
    startPath: "M 0 250 C 1200 400 1200 50 3000 250 L 3000 550 L 0 550 L 0 250",
    middlePath: "M 0 250 C 400 50 400 400 3000 250 L 3000 550 L 0 550 L 0 250",
    endPath: "M 0 250 C 1200 400 1200 50 3000 250 L 3000 550 L 0 550 L 0 250",
    animationDuration: "5s",
    repeatCount: "indefinite",
    fillColor: "#ffffff"
   } %}
*/

	eleventyConfig.addShortcode(
		"SvgPathWaveAnimation",
		function ({
			startPath,
			middlePath,
			endPath,
			animationDuration,
			repeatCount,
			fillColor,
		}) {
			return `
        <div class="shape-image-animation bottom-0 p-0 w-100 d-none d-md-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="3000" height="400" viewBox="0 180 2500 200" fill="${fillColor}">
                <path class="st1" d="${startPath}">
                    <animate attributeName="d" dur="${animationDuration}" values="${startPath}; ${middlePath}; ${endPath}" repeatCount="${repeatCount}"></animate>
                </path>
            </svg>
        </div>
    `;
		}
	);

	///////////////////
	// TeamShowcaseSection
	//////////////////

	/*
   Usage:
   /*
   {% TeamShowcaseSection {
    teamMembers: [
        {
            defaultImg: "https://via.placeholder.com/500",
            hoverImg: "https://via.placeholder.com/500",
            socialLink: "https://www.twitter.com/",
            socialIcon: "fa-twitter",
            name: "Jeremy Dupont",
            designation: "Designer"
        },
        {
            defaultImg: "https://via.placeholder.com/500",
            hoverImg: "https://via.placeholder.com/500",
            socialLink: "https://www.facebook.com/",
            socialIcon: "fa-facebook-f",
            name: "Matthew Taylor",
            designation: "Writer"
        },
        
    ]
   } %}
*/

	eleventyConfig.addShortcode(
		"TeamShowcaseSection",
		function ({ teamMembers }) {
			const memberHtml = teamMembers
				.map(
					(member) => `
        <div class="col team-style-10 md-ps-15px md-pe-15px md-mb-30px" style="">
            <figure class="mb-0 position-relative overflow-hidden">
                <img src="${member.defaultImg}" class="w-100" alt="" data-no-retina>
                <img src="${member.hoverImg}" class="hover-switch-image" alt="" data-no-retina>
                <figcaption class="w-100 h-100 d-flex flex-wrap">
                    <div class="social-icon d-flex flex-column flex-shrink-1 mb-auto p-30px ms-auto">
                        <a href="${member.socialLink}" target="_blank" class="text-white bg-dark-gray">
                            <i class="fa-brands ${member.socialIcon} icon-small"></i>
                        </a>
                    </div>
                    <div class="team-member-strip w-100 mt-auto d-flex align-items-center pt-15px pb-15px ps-30px pe-30px bg-white">
                        <span class="team-member-name fw-600 alt-font text-dark-gray fs-18 ls-minus-05px">${member.name}</span>
                        <span class="member-designation fs-15 lh-20 ms-auto alt-font">${member.designation}</span>
                    </div>
                </figcaption>
            </figure>
        </div>
    `
				)
				.join("");

			return `
        <section class="pb-0">
            <div class="container-fluid p-0">
                <div class="row row-cols-1 row-cols-lg-4 row-cols-sm-2 g-0 " data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;rotateX&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                    ${memberHtml}
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// testimonial section
	//////////////////

	/*
   Usage:
   /*

{% DynamicSection {
    testimonials: [
        { image: "https://via.placeholder.com/500x500", name: "Charlotte Smith", text: "Testimonial text here", role: "Role here", stars: [1,1,1,1,1], index: 0, label: "1 / 3" },
        { image: "https://via.placeholder.com/500x500", name: "Herman Miller", text: "Another testimonial text", role: "Role here", stars: [1,1,1,1,1], index: 1, label: "2 / 3" }
    ],
    clients: [
        { logo: "https://via.placeholder.com/200x50", link: "#" },
        { logo: "https://via.placeholder.com/200x50", link: "#" }
    ]
} %}


*/

	eleventyConfig.addShortcode("DynamicSection", function (data) {
		// Construct HTML for testimonials dynamically
		const testimonialsHtml = data.testimonials
			.map(
				(testimonial) => `
        <div class="swiper-slide" style="width: 690px; margin-right: 50px;" role="group" aria-label="${
					testimonial.label
				}" data-swiper-slide-index="${testimonial.index}">
            <div class="row g-0 border-radius-6px overflow-hidden">
                <div class="col-sm-5 services-box-img xs-h-350px">
                    <div class="h-100 cover-background" style="background-image: url('${
											testimonial.image
										}')"></div>
                </div>
                <div class="col-sm-7 testimonials-box bg-white p-9 sm-p-7 box-shadow-extra-large">
                    <div class="d-inline-block bg-orange text-white border-radius-50px ps-20px pe-20px fs-15 lh-34 sm-lh-30 ls-minus-1px mb-25px align-middle">
                        ${testimonial.stars
													.map(() => `<i class="bi bi-star-fill"></i>`)
													.join("")}
                    </div>
                    <div class="testimonials-box-content">
                        <p class="mb-20px">${testimonial.text}</p>
                        <div class="fs-18 lh-20 fw-600 text-dark-gray">${
													testimonial.name
												}</div>
                        <span class="fs-16 lh-20">${testimonial.role}</span>
                    </div>
                </div>
            </div>
        </div>
    `
			)
			.join("");

		// Construct HTML for clients dynamically
		const clientsHtml = data.clients
			.map(
				(client) => `
        <div class="col md-mb-40px" style="">
            <div class="client-box">
                <a href="${client.link}"><img src="${client.logo}" class="h-40px" alt="" data-no-retina=""></a>
            </div>
        </div>
    `
			)
			.join("");

		// Return the full section HTML
		return `
        <section class="position-relative bg-gradient-aztec-green overflow-hidden">
            <div class="container">
                <div class="row justify-content-center align-items-center appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;opacity&quot;: [0, 1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                    <!-- Testimonials swiper here -->
                    <div class="swiper magic-cursor swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ &quot;slidesPerView&quot;: 1, &quot;spaceBetween&quot;: 50, &quot;loop&quot;: true, &quot;autoplay&quot;: { &quot;delay&quot;: 4000, &quot;disableOnInteraction&quot;: false },  &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;effect&quot;: &quot;slide&quot;, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.swiper-button-next-nav&quot;, &quot;prevEl&quot;: &quot;.swiper-button-previous-nav&quot; } }">
                        <div class="swiper-wrapper">${testimonialsHtml}</div>
                        <div class="swiper-button-next-nav swiper-button-next bg-white box-shadow-small"></div>
                        <div class="swiper-button-previous-nav swiper-button-prev bg-white box-shadow-small"></div>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-lg-5 row-cols-md-3 row-cols-sm-3 text-center justify-content-center clients-style-05 mt-6 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;opacity&quot;: [0, 1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                    ${clientsHtml}
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// MenuPriceSection
	//////////////////

	/*
   Usage:
   /*
{% MenuPriceSection {
    tabs: [
      {
        id: "tab_first1",
        title: "Skin Treatments",
        icon: "Chopsticks", 
        items: [
          {
            image: "https://via.placeholder.com/150",
            title: "Anti-Aging Facial",
            description: "Target fine lines, wrinkles, and sun damage with this rejuvenating facial treatment.",
            price: "$150"
          },
          {
            image: "https://via.placeholder.com/150",
            title: "Acne Clearance",
            description: "Reduce the appearance of acne with specialized treatments tailored to your skin type.",
            price: "$120"
          }
        ]
      },
      {
        id: "tab_first2",
        title: "Body Treatments",
        icon: "Bike-Helmet", 
        items: [
          {
            image: "https://via.placeholder.com/150",
            title: "Body Contouring",
            description: "Sculpt and tone your body with our advanced body contouring techniques.",
            price: "$200"
          },
          {
            image: "https://via.placeholder.com/150",
            title: "Laser Hair Removal",
            description: "Enjoy smooth skin with our effective laser hair removal services.",
            price: "$90 per session"
          }
        ]
      }
    ]
} %}

*/

	eleventyConfig.addShortcode("MenuPriceSection", function ({ tabs }) {
		let navHtml = tabs
			.map(
				(tab, index) => `
        <li class="nav-item" role="presentation">
            <a class="nav-link ${index === 0 ? "active" : ""}" id="nav-${
					tab.id
				}-tab" data-bs-toggle="tab" href="#${tab.id}" aria-controls="${
					tab.id
				}" aria-selected="${index === 0 ? "true" : "false"}" role="tab">
                <i class="line-icon-${
									tab.icon
								} d-block icon-large mb-10px"></i>${tab.title}
            </a>
        </li>
    `
			)
			.join("");

		let contentHtml = tabs
			.map(
				(tab, index) => `
        <div class="tab-pane fade ${index === 0 ? "show active" : ""}" id="${
					tab.id
				}" role="tabpanel" aria-labelledby="nav-${tab.id}-tab">
            <div class="row justify-content-center">
                ${tab.items
									.map(
										(item) => `
                    <div class="col-lg-6 sm-mb-20px">
                        <ul class="pricing-table-style-12 ${
													item.side ? "ps-15px" : "pe-15px"
												} md-ps-0 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;rotateX&quot;: [-40, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                            <li class="last-paragraph-no-margin" style="">
                                <img src="${
																	item.image
																}" class="rounded-circle" alt="" data-no-retina="">
                                <div class="ms-30px xs-ms-0 flex-grow-1">
                                    <div class="d-flex align-items-center w-100 fs-18 mb-5px">
                                        <span class="fw-600 text-dark-gray">${
																					item.title
																				}</span>
                                        <div class="divider-style-03 divider-style-03-02 border-color-extra-medium-gray flex-grow-1 ms-20px me-20px"></div>
                                        <div class="ms-auto fw-600 text-dark-gray">${
																					item.price
																				}</div>
                                    </div>
                                    <p>${item.description}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                `
									)
									.join("")}
            </div>
        </div>
    `
			)
			.join("");

		return `
        <section class="cover-background" style="background-image: url('/path/to/default-background.jpg')">
            <div class="container">
                <div class="row justify-content-center mb-1">
                    <div class="col-lg-7 text-center appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [50, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                        <span class="fs-15 fw-600 text-red text-uppercase mb-10px d-block"><span class="w-5px h-2px bg-red d-inline-block align-middle me-5px"></span>Choose delicious<span class="w-5px h-2px bg-red d-inline-block align-middle ms-5px"></span></span>
                        <h2 class="alt-font text-dark-gray">Popular menu</h2>
                    </div>
                </div>
                <div class="row mb-6 xs-mb-8">
                    <div class="col tab-style-02 fs-600">
                        <ul class="nav nav-tabs fs-18 fw-500 justify-content-center text-center mb-4 sm-mb-0 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;rotateX&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }" role="tablist">
                            ${navHtml}
                        </ul>
                        <div class="tab-content">
                            ${contentHtml}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// CustomSalonSection
	//////////////////

	/*
   Usage:
   /*
   {% CustomSalonSection {
      backgroundImage: "path/to/default-background.jpg",
      image: "path/to/default-image.png",
      focusTitle: "Beauty salon focus on",
      mainTitle: "The quest for quality and safety.",
      sections: [
        {
          title: "Quality and safety as our absolute priority",
          content: "For more than 110 years, we have devoted our energy and our competencies solely to one business: beauty.",
          isOpen: true
        },
        {
          title: "Helping hundreds of millions of women",
          content: "For more than 110 years, we have devoted our energy and our competencies solely to one business: beauty.",
          isOpen: false
        }
      ],
      buttonText: "Book appointment",
      buttonLink: "link-to-appointment.html"
    } %}
*/

	eleventyConfig.addShortcode(
		"CustomSalonSection",
		function ({
			backgroundImage,
			image,
			focusTitle,
			mainTitle,
			sections,
			buttonText,
			buttonLink,
		}) {
			let sectionHtml = sections
				.map(
					(section, index) => `
        <div class="accordion-item ${section.isOpen ? "active-accordion" : ""}">
            <div class="accordion-header">
                <a href="#" data-bs-toggle="collapse" data-bs-target="#accordion-style-02-${
									index + 1
								}" aria-expanded="${
						section.isOpen
					}" data-bs-parent="#accordion-style-02">
                    <div class="accordion-title mb-0 position-relative text-white">
                        <i class="feather icon-feather-${
													section.isOpen ? "minus" : "plus"
												}"></i><span class="fw-500 fs-19">${
						section.title
					}</span>
                    </div>
                </a>
            </div>
            <div id="accordion-style-02-${
							index + 1
						}" class="accordion-collapse collapse ${
						section.isOpen ? "show" : ""
					}" data-bs-parent="#accordion-style-02">
                <div class="accordion-body last-paragraph-no-margin">
                    <p class="text-white opacity-5">${section.content}</p>
                </div>
            </div>
        </div>
    `
				)
				.join("");

			return `
        <section class="cover-background p-0" style="background-image: url('${backgroundImage}')">
            <div class="container">
                <div class="row">
                    <div class="col-lg-6 align-self-end order-2 order-lg-1">
                        <div class="outside-box-left-5 outside-box-right-5">
                            <img src="${image}" alt="" data-no-retina="" class="static-image">
                        </div>
                    </div>
                    <div class="col-xl-5 col-lg-6 offset-xl-1 pt-8 pb-10 align-self-end order-1 order-lg-2">
                        <span class="fs-16 text-uppercase text-base-color fw-600 mb-20px d-inline-block ls-2px">${focusTitle}</span>
                        <h2 class="alt-font fw-400 text-white">${mainTitle}</h2>
                        <div class="accordion accordion-style-02 mb-25px xs-mb-15px" id="accordion-style-02" data-active-icon="icon-feather-minus" data-inactive-icon="icon-feather-plus">
                            ${sectionHtml}
                        </div>
                        <a href="${buttonLink}" class="btn btn-large btn-base-color btn-hover-animation-switch btn-round-edge btn-box-shadow">
                            <span>
                                <span class="btn-text">${buttonText}</span>
                                <span class="btn-icon"><i class="fa-solid fa-arrow-right fs-14"></i></span>
                                <span class="btn-icon"><i class="fa-solid fa-arrow-right fs-14"></i></span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// BeautyTipsSlider
	//////////////////

	/*
   Usage:


{% BeautyTipsSlider [{
    title: "Avocado",
    description: "The fruit is rich in antioxidants and contains anti-inflammatory properties."
}, {
    title: "Turmeric",
    description: "Its healing properties can repair sun damage and reduce sunburns."
}, {
    title: "Honey",
    description: "This golden potion is great for your health when taken externally."
}] %}


*/

	eleventyConfig.addShortcode("BeautyTipsSlider", function (items) {
		const slides = items
			.map(
				(item, index) => `
        <div class="swiper-slide pe-60px ps-60px" role="group" aria-label="${
					index + 1
				} / ${
					items.length
				}" style="width: 630px;" data-swiper-slide-index="${index}">
            <div class="h-100 d-flex justify-content-center align-items-center flex-column">
                <div class="fs-20"><span class="text-dark-gray fw-600">${
									item.title
								}:</span> ${item.description}</div>
            </div>
        </div>
    `
			)
			.join("");

		return `
        <section class="p-0 border-bottom border-color-extra-medium-gray">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-xl-3 col-lg-4 md-mt-30px text-center text-lg-start">
                        <h5 class="alt-font text-dark-gray mb-0">2023 beauty tips</h5>
                    </div>
                    <div class="col-xl-9 col-lg-8 p-45px border-start border-color-extra-medium-gray text-center md-border-start-0 md-pt-15px md-pb-30px sm-ps-0 sm-pe-0">
                        <div class="swiper slider-one-slide magic-cursor swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ &quot;slidesPerView&quot;: 1, &quot;loop&quot;: true, &quot;pagination&quot;: { &quot;el&quot;: &quot;.slider-one-slide-pagination&quot;, &quot;clickable&quot;: true }, &quot;autoplay&quot;: { &quot;delay&quot;: 5000, &quot;disableOnInteraction&quot;: false }, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.swiper-button-next-nav&quot;, &quot;prevEl&quot;: &quot;.swiper-button-previous-nav&quot; }, &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;effect&quot;: &quot;slide&quot; }">
                            <div class="swiper-wrapper" id="swiper-wrapper-${Date.now()}" aria-live="off">
                                ${slides}
                            </div>
                            <div class="swiper-button-previous-nav swiper-button-prev" tabindex="0" role="button" aria-label="Previous slide"><i class="bi bi-arrow-left icon-extra-medium text-dark-gray d-flex"></i></div>
                            <div class="swiper-button-next-nav swiper-button-next" tabindex="0" role="button" aria-label="Next slide"><i class="bi bi-arrow-right icon-extra-medium text-dark-gray d-flex"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// SpecialistSection
	//////////////////

	/*
   Usage
   /*
   {% SpecialistSection {
    teamMembers: [
        {
            image: "https://via.placeholder.com/500x600",
            name: "Jeremy Dupont",
            role: "Director",
            facebook: "https://www.facebook.com/",
            instagram: "https://www.instagram.com/",
            twitter: "https://www.twitter.com/",
            dribbble: "http://www.dribbble.com"
        },
        {
            image: "https://via.placeholder.com/500x600",
            name: "Matthew Taylor",
            role: "Makeup",
            facebook: "https://www.facebook.com/",
            instagram: "https://www.instagram.com/",
            twitter: "https://www.twitter.com/",
            dribbble: "http://www.dribbble.com"
        }
    ],
    totalVisitors: "25,000+",
    visitorsDescription: "Beauty lovers visited our beauty salon."
   } %}
*/

	eleventyConfig.addShortcode(
		"SpecialistSection",
		function ({ teamMembers, totalVisitors, visitorsDescription }) {
			const teamHtml = teamMembers
				.map(
					(member) => `
        <div class="col text-center team-style-05 md-mb-35px border-radius-6px">
            <div class="position-relative mb-30px">
                <img src="${member.image}" class="border-radius-6px" alt="" data-no-retina="">
                <div class="w-100 h-100 d-flex flex-column justify-content-end align-items-center p-40px lg-p-20px team-content bg-gradient-dark-transparent border-radius-6px">
                    <div class="social-icon fs-19">
                        <a href="${member.facebook}" target="_blank" class="text-white"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="${member.instagram}" target="_blank" class="text-white"><i class="fa-brands fa-instagram"></i></a>
                        <a href="${member.twitter}" target="_blank" class="text-white"><i class="fa-brands fa-twitter"></i></a>
                        <a href="${member.dribbble}" target="_blank" class="text-white"><i class="fa-brands fa-dribbble"></i></a>
                    </div>
                </div>
            </div>
            <div class="alt-font text-dark-gray lh-24 fs-20">${member.name}</div>
            <span>${member.role}</span>
        </div>
    `
				)
				.join("");

			return `
        <section>
            <div class="container">
                <div class="row justify-content-center align-items-center mb-6">
                    <div class="col-auto pe-25px border-2 border-end border-color-dark-gray sm-border-end-0 sm-pe-15px">
                        <span class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px">Our specialists</span>
                    </div>
                    <div class="col-12 col-md-auto ps-25px sm-ps-15px text-center">
                        <h3 class="alt-font fw-400 text-dark-gray ls-minus-1px mb-0">Beauty experts</h3>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-lg-4 row-cols-md-2 mb-5 md-mb-40px">
                    ${teamHtml}
                </div>
                <div class="row">
                    <div class="col-12 text-center">
                        <div class="fs-26 text-dark-gray alt-font">
                            <div class="text-center bg-base-color text-white fs-16 lh-36 border-radius-30px d-inline-block ps-20px pe-20px align-middle me-10px">
                                <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
                            </div>
                            <div class="d-inline-block align-middle">${totalVisitors} ${visitorsDescription}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	///////////////////
	// TestimonialSection
	//////////////////

	/*
   Usage
   /*
{% TestimonialSection {
    testimonials: [
        {
            name: "Emma Causer",
            review: "A wonderfully professional salon, beautiful location and beautifully kept. Great products knowledge.",
            rating: 5
        },
        {
            name: "Lesley Simms",
            review: "Perfection isn't just any other salon. It's a complete cut above the rest. Highly recommended!",
            rating: 5
        }
      
    ]
} %}

*/

	eleventyConfig.addShortcode("TestimonialSection", function (data) {
		const testimonials = data.testimonials;
		const testimonialHtml = testimonials
			.map((testimonial, index) => {
				// Dynamically assign classes to manage active and next slide visuals
				let slideClass = "swiper-slide";
				if (index === 0) slideClass += " swiper-slide-active";
				if (index === 1) slideClass += " swiper-slide-next";

				return `
            <div class="${slideClass}" style="width: 450.5px; margin-right: 30px;" role="group" aria-label="${
					index + 1
				} / ${testimonials.length}" data-swiper-slide-index="${index}">
                <div class="border border-color-extra-medium-gray border-radius-6px d-flex">
                    <div class="p-15px">
                        <div class="vertical-title-center align-items-center">
                            <div class="title fs-16 text-dark-gray fw-700 text-uppercase ls-1px">${
															testimonial.name
														}</div>
                        </div>
                    </div>
                    <div class="p-40px border-start border-color-extra-medium-gray d-flex justify-content-center xs-p-25px">
                        <div>
                            <p class="mb-10px w-95 xl-w-100">${
															testimonial.review
														}</p>
                            <div class="text-gradient-san-blue-new-york-red d-inline-block fs-20">
                                ${"★".repeat(testimonial.rating)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
			})
			.join("");

		return `
        <section class="position-relative overflow-hidden pt-0">
            <div class="container">
            <div class="row appear anime-child anime-complete" data-anime="{&quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }"
                    <div class="col-xl-3 col-lg-4 md-mb-35px text-center text-lg-start" style="">
                        <span class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px mb-5px d-inline-block">Testimonial</span>
                        <h4 class="alt-font fw-400 text-dark-gray ls-minus-1px">Our happy beauty lovers.</h4>
                        <div class="d-flex justify-content-center justify-content-lg-start">
                        <div class="slider-one-slide-prev-1 swiper-button-prev slider-navigation-style-04 border border-color-extra-medium-gray" tabindex="0" role="button" aria-label="Previous slide" aria-controls="swiper-wrapper-e337b3a5d5098106e"><i class="bi bi-arrow-left-short icon-very-medium text-dark-gray"></i></div>
                        <div class="slider-one-slide-next-1 swiper-button-next slider-navigation-style-04 border border-color-extra-medium-gray" tabindex="0" role="button" aria-label="Next slide" aria-controls="swiper-wrapper-e337b3a5d5098106e"><i class="bi bi-arrow-right-short icon-very-medium text-dark-gray"></i></div>
    
                        </div>
                    </div>
                    <div class="col-xl-9 col-lg-8 review-style-10 position-relative ps-4 lg-ps-15px">
                        <div class="outside-box-right-25 sm-outside-box-right-0">
                            <div class="swiper magic-cursor swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options='{"slidesPerView": 1, "spaceBetween": 30, "loop": true, "navigation": { "nextEl": ".slider-one-slide-next-1", "prevEl": ".slider-one-slide-prev-1" }, "autoplay": { "delay": 4000, "disableOnInteraction": false },  "pagination": { "el": ".slider-three-slide-pagination", "clickable": true, "dynamicBullets": false }, "keyboard": { "enabled": true, "onlyInViewport": true }, "breakpoints": { "1200": { "slidesPerView": 3 }, "992": { "slidesPerView": 2 }, "768": { "slidesPerView": 2 }, "320": { "slidesPerView": 1 } }, "effect": "slide" }'>
                                <div class="swiper-wrapper" id="swiper-wrapper-ecbd103073cca80e4" aria-live="off">
                                    ${testimonialHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
	});

	///////////////////
	// DynamicProjectShowcase
	//////////////////

	/*
   Usage
   /*
  
{% DynamicProjectShowcase {
  projects: [
    {

      imageUrl: "https://via.placeholder.com/1920x1080",
      title: "Latest projects",
      category: "Branding and design",
      projectName: "Whiteline face beauty",
      description: "Creating products with a strong identity. Provide brilliant ideas and adding the world called success brand. We deliver customized marketing campaign to use your audience to make a positive move.",
      link: "demo-branding-agency-single-project-slider.html"
    },
    {

      imageUrl: "https://via.placeholder.com/1920x1080",
      title: "Latest projects",
      category: "Web development and design",
      projectName: "Rebounce force riders",
      description: "We specialize in developing products with a distinct and compelling identity. Our team excels generating brilliant ideas that propel brands to success. Through customized marketing campaigns.",
      link: "demo-branding-agency-single-project-slider.html"
    },
    {
     
      imageUrl: "https://via.placeholder.com/1920x1080",
      title: "Latest projects",
      category: "Branding and design",
      projectName: "Decorator hard carpet",
      description: "Creating products with a strong identity. Provide brilliant ideas and adding the world called success brand. We deliver customized marketing campaign to use your audience to make a positive move.",
      link: "demo-branding-agency-single-project-slider.html"
    }
  ]
} %}

*/

	eleventyConfig.addShortcode(
		"DynamicProjectShowcase",
		function ({ projects }) {
			return `
        <section class="stack-box py-0 z-index-99 forward">
            <div class="stack-box-contain">
                ${projects
									.map((project, index) => {
										const projectNumber =
											index + 1 < 10
												? "0" + (index + 1)
												: (index + 1).toString();
										return `
                    <div class="stack-item bg-white lg-pt-8 lg-pb-8 md-pb-0 active" style="height: inherit;">
                        <div class="stack-item-wrapper">
                            <div class="container-fluid">
                                <div class="row align-items-center full-screen md-h-auto">
                                    <div class="col-lg-6 cover-background overflow-visible h-100 md-h-500px" style="background-image: url(${project.imageUrl})">
                                        <div class="position-absolute right-minus-130px top-60px md-top-auto md-bottom-minus-50px fs-170 lg-fs-120 lg-right-minus-80px md-right-0px md-left-0px text-center text-lg-start alt-font z-index-9 fw-600 text-dark-gray opacity-3">${projectNumber}</div>
                                        <div class="position-absolute right-0px bottom-minus-1px">
                                            <div class="vertical-title-center">
                                                <div class="title fw-700 fs-15 alt-font text-uppercase text-dark-gray bg-white pt-30px pb-30px ps-10px pe-10px">
                                                    <span class="d-inline-block">${project.title}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6 ps-12 pe-14 xxl-ps-10 xxl-pe-10 xl-pe-8 lg-ps-6 lg-pe-4 md-p-50px sm-ps-30px sm-pe-30px position-relative align-self-center text-md-start text-center">
                                        <div class="mb-15px">
                                            <span class="w-25px h-1px d-inline-block bg-base-color me-5px align-middle"></span>
                                            <span class="text-gradient-base-color fs-15 alt-font fw-700 ls-05px text-uppercase d-inline-block align-middle">${project.category}</span>
                                        </div>
                                        <h1 class="text-dark-gray alt-font fw-600 ls-minus-4px mb-25px">${project.projectName}</h1>
                                        <p class="w-95 md-w-100 mb-35px">${project.description}</p>
                                        <a href="${project.link}" class="btn btn-large btn-dark-gray btn-switch-text btn-box-shadow fw-400">
                                            <span>
                                                <span class="btn-double-text" data-text="Explore project">Explore project</span>
                                                <span><i class="feather icon-feather-arrow-right"></i></span>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
									})
									.join("")}
            </div>
        </section>
    `;
		}
	);

	//////////////////
	// PopularProductsSliderSection
	//////////////////

	/*
   Usage:

{% PopularProductsSliderSection {
  products: [
    {
      imageUrl: "https://via.placeholder.com/1920x1080",
      name: "Chicken breast burger",
      price: "35.00",
      ingredients: ["Capsicum", "Parmesan", "Paneer"],
      title: "Popular dishes"
    },
    {
      imageUrl: "https://via.placeholder.com/1920x1080",
      name: "Medium spicy chips",
      price: "35.00",
      ingredients: ["Cheese", "Capsicum", "Basil"],
      title: "Popular dishes"
    }
  ]
} %}
   

*/

	eleventyConfig.addShortcode(
		"PopularProductsSliderSection",
		function ({ products }) {
			return `
        <section class="overflow-hidden overlap-height position-relative">
            <div class="container-fluid overlap-gap-section">
                <div class="row justify-content-center mb-2">
                    ${products
											.map(
												(product) => `
                    <div class="col-lg-7 text-center">
                        <span class="fs-15 fw-600 text-red text-uppercase mb-10px d-block">
                            <span class="w-5px h-2px bg-red d-inline-block align-middle me-5px"></span>
                            ${product.title}
                            <span class="w-5px h-2px bg-red d-inline-block align-middle ms-5px"></span>
                        </span>
                        <h2 class="alt-font text-dark-gray">${product.title}</h2>
                    </div>
                    `
											)
											.slice(0, 1)
											.join("")}
                </div>
                <div class="row">
                    <div class="col-md-12 position-relative feather-shadow sm-feather-shadow-none">
                        <div class="swiper swiper-dark-pagination swiper-line-pagination-style-01 magic-cursor" data-slider-options='{
                            "slidesPerView": 1, "spaceBetween": 30, "loop": true,
                            "autoplay": { "delay": 2500, "disableOnInteraction": false },
                            "pagination": { "el": ".slider-four-slide-pagination-1", "clickable": true },
                            "keyboard": { "enabled": true, "onlyInViewport": true },
                            "breakpoints": { "1200": { "slidesPerView": 5 }, "992": { "slidesPerView": 3 },
                            "768": { "slidesPerView": 3 }, "576": { "slidesPerView": 2 } },
                            "effect": "slide"
                        }'>
                            <div class="swiper-wrapper">
                                ${products
																	.map(
																		(product) => `
                                <div class="swiper-slide">
                                    <div class="services-box-style-01 hover-box last-paragraph-no-margin">
                                        <div class="position-relative box-image border-radius-6px">
                                            <img class="w-100" src="${
																							product.imageUrl
																						}" alt="${
																			product.name
																		}" data-no-retina="">
                                            <div class="box-overlay bg-dark-gray"></div>
                                            <span class="d-flex justify-content-center align-items-center mx-auto icon-box absolute-middle-center z-index-1 w-130px h-130px rounded-circle bg-white box-shadow-extra-large text-uppercase alt-font fs-30 lh-28 text-red ps-15px pe-15px text-center">
                                                Just $${product.price}
                                            </span>
                                        </div>
                                        <div class="pt-30px bg-white text-center">
                                            <span class="d-inline-block text-dark-gray fs-19 fw-600">${
																							product.name
																						}</span>
                                            <div class="w-100">
                                                ${product.ingredients
																									.map(
																										(ingredient) => `
                                                    <span class="d-inline-block align-middle">${ingredient}</span>
                                                    <span class="d-inline-block align-middle ms-10px me-10px fs-12 opacity-5">◍</span>
                                                `
																									)
																									.join("")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                `
																	)
																	.join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	//////////////////
	// BoldTickerSection
	//////////////////

	/*
   Usage:

{% BoldTickerSection {
  texts: [
    {
      content: "Cuisine",
      style: "text-dark-gray"
    },
    {
      content: "Delicious",
      style: "text-outline text-outline-color-base-color"
    },
    {
      content: "Awesome",
      style: "text-dark-gray"
    },
    {
      content: "Experience",
      style: "text-outline text-outline-color-base-color"
    }
  ]
} %}
   
*/

	eleventyConfig.addShortcode("BoldTickerSection", function ({ texts }) {
		return `
    <section>
        <div class="container-fluid overlap-section">
            <div class="row position-relative mb-4" data-anime="{ &quot;translateY&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                <div class="col swiper swiper-width-auto text-center" data-slider-options="{ &quot;slidesPerView&quot;: &quot;auto&quot;, &quot;spaceBetween&quot;: 50, &quot;speed&quot;: 10000, &quot;loop&quot;: true, &quot;pagination&quot;: { &quot;el&quot;: &quot;.slider-four-slide-pagination-2&quot;, &quot;clickable&quot;: false }, &quot;allowTouchMove&quot;: false, &quot;autoplay&quot;: { &quot;delay&quot;: 0, &quot;disableOnInteraction&quot;: false }, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.slider-four-slide-next-2&quot;, &quot;prevEl&quot;: &quot;.slider-four-slide-prev-2&quot; }, &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;effect&quot;: &quot;slide&quot; }">
                    <div class="swiper-wrapper marquee-slide">
                        ${texts
													.map(
														(text) => `
                        <div class="swiper-slide">
                            <div class="fs-150 ls-minus-2px alt-font ${text.style}">${text.content}</div>
                        </div>
                        `
													)
													.join("")}
                    </div>
                </div>
            </div>
        </div>
        </section>
    `;
	});

	//////////////////
	// FaqBoxSection
	//////////////////

	/*
   Usage:

{% FaqBoxSection {
  questions: [
    {
      question: "What is the main role played by a business planning consultant?",
      answer: "Business planning consultants analyze organizational processes, set objectives, and provide strategies to ensure the financial success and growth of the company."
    },
    {
      question: "What are the main stages of business plan consulting?",
      answer: "The stages typically include initial assessment, market analysis, financial structuring, strategic planning, and implementation support."
    },
    {
      question: "What are the advantages of using business plan consulting services?",
      answer: "These services can provide expert insights, save time and resources, and enhance business growth through tailored strategies."
    }
  ],
  title: "Frequently asked questions",
  subtitle: "Basic information",
  imageUrl: "https://via.placeholder.com/250x150"
} %}
   
*/

	eleventyConfig.addShortcode(
		"FaqBoxSection",
		function ({ questions, title, subtitle, imageUrl }) {
			return `
    <section>
    <div class= "container">
        <div class="row align-items-center mt-8 sm-mt-40px">
            <div class="col-12">
                <div class="bg-linen p-9 md-p-6 xs-p-9 border-radius-6px overflow-hidden position-relative">
                    <div class="position-absolute right-70px lg-right-20px top-minus-20px w-250px sm-w-180px xs-w-150px opacity-1">
                        <img src="${imageUrl}" alt="FAQ Image" data-no-retina="">
                    </div>
                    <div class="mb-10px">
                        <span class="w-25px h-1px d-inline-block bg-base-color me-5px align-middle"></span>
                        <span class="text-gradient-base-color fs-15 alt-font fw-700 ls-05px text-uppercase d-inline-block align-middle">${subtitle}</span>
                    </div>
                    <h3 class="alt-font fw-600 text-dark-gray ls-minus-1px">${title}</h3>
                    <div class="accordion accordion-style-02" id="accordionFaq" data-active-icon="icon-feather-minus" data-inactive-icon="icon-feather-plus">
                        ${questions
													.map(
														(item, index) => `
                        <div class="accordion-item ${
													index === 0 ? "active-accordion" : ""
												}">
                            <div class="accordion-header border-bottom border-color-transparent-dark-very-light">
                                <a href="#" data-bs-toggle="collapse" data-bs-target="#accordionFaq-${index}" aria-expanded="${
															index === 0 ? "true" : "false"
														}" data-bs-parent="#accordionFaq">
                                    <div class="accordion-title mb-0 position-relative text-dark-gray pe-30px">
                                        <i class="feather icon-feather-${
																					index === 0 ? "minus" : "plus"
																				} fs-20"></i><span class="fw-500">${
															item.question
														}</span>
                                    </div>
                                </a>
                            </div>
                            <div id="accordionFaq-${index}" class="accordion-collapse collapse ${
															index === 0 ? "show" : ""
														}" data-bs-parent="#accordionFaq">
                                <div class="accordion-body last-paragraph-no-margin border-bottom border-color-transparent-dark-very-light">
                                    <p class="w-90 sm-w-95 xs-w-100">${
																			item.answer
																		}</p>
                                </div>
                            </div>
                        </div>
                        `
													)
													.join("")}
                    </div>
                </div>
            </div>
        </div>
        </div>
        </section>
    `;
		}
	);

	//////////////////
	// MovingCounterStatSection
	//////////////////

	/*
   Usage:

{% MovingCounterStatSection {
  title: "Brand experience",
  stats: [
    {
      imageUrl: "https://via.placeholder.com/250x150",
      secondaryImageUrl: "https://via.placeholder.com/250x150",
      title: "agency",
      description: "Creating products with a strong identity. We provide brilliant ideas and adding the world called success brand.",
      counters: [
        { number: 8500, text: "Users on marketplaces we've created in 2023." },
        { number: 660, text: "Successfully finished projects with creativity." },
        { number: 6834, text: "Monthly visitors on our e-Commerce platform." },
        { number: 38, suffix: "%", text: "Onboarding conversions growth increased." }
      ]
    }
  ]
} %}
   
*/

	eleventyConfig.addShortcode(
		"MovingCounterStatSection",
		function ({ title, stats }) {
			function buildCounterHtml(number) {
				let html = "";
				number
					.toString()
					.split("")
					.forEach((digit) => {
						html +=
							`<span class="vertical-counter-number" data-to="${digit}"><ul style="transform: translateY(-${
								digit * 10
							}%);">` +
							Array.from({ length: 10 }, (_, i) => `<li>${i}</li>`).join("") +
							`</ul></span>`;
					});
				return html;
			}

			return `
        <section>
            <div class="container">
                <div class="row mb-6 sm-mb-50px">
                    <div class="col-md-12 text-center text-md-start">
                        <div class="fs-140 xxl-fs-100 sm-fs-60 fw-600 text-dark-gray alt-font ls-minus-8px sm-ls-minus-2px" data-bottom-top="transform: translate3d(-50px, 0px, 0px);" data-top-bottom="transform: translate3d(50px, 0px, 0px);">${title}</div>
                    </div>
                    ${stats
											.map(
												(stat) => `
                    <div class="col-12">
                        <div class="row align-items-center align-items-lg-end" data-bottom-top="transform: translate3d(-30px, 0px, 0px);" data-top-bottom="transform: translate3d(30px, 0px, 0px);">
                            <div class="col-lg-3 col-md-4 text-md-end text-center md-mt-30px md-mb-20px">
                                <div class="position-relative">
                                    <img src="${stat.imageUrl}" class="animation-rotation position-relative z-index-2" alt="" data-no-retina="">
                                    <div class="absolute-middle-center w-100 z-index-1"><img src="${stat.secondaryImageUrl}" alt="" data-no-retina=""></div>
                                </div>
                            </div>
                            <div class="col-lg-5 col-md-6 text-center text-md-start">
                                <div class="fs-140 xxl-fs-100 sm-fs-60 fw-600 text-dark-gray alt-font ls-minus-8px sm-ls-minus-2px">${stat.title}</div>
                            </div>
                            <div class="col-lg-4 last-paragraph-no-margin md-mt-30px">
                                <p class="w-95 md-w-80 mx-auto text-center text-lg-start sm-w-100">${stat.description}</p>
                            </div>
                        </div>
                    </div>
                    `
											)
											.join("")}
                </div>
                <div class="row g-0 counter-style-04">
                    ${stats[0].counters
											.map(
												(counter) => `
                    <div class="col-lg-3 col-md-6 feature-box text-start hover-box border-start sm-border border-color-extra-medium-gray ps-35px pe-35px pt-25px pb-25px lg-ps-25px lg-pe-25px md-ps-35px md-pe-35px md-mb-50px sm-mb-30px">
                        <div class="feature-box-content">
                            <p class="text-dark-gray mb-20 sm-mb-10 fw-500 w-90 fs-17 lh-28">${
															counter.text
														}</p>
                            <h2 class="vertical-counter d-inline-flex text-dark-gray fw-700 ls-minus-2px mt-25 alt-font mb-0 appear" data-text="${
															counter.suffix || ""
														}" data-to="${
													counter.number
												}" style="height: 41.25px;">
                                <sup class="text-dark-gray top-0"><i class="feather icon-feather-arrow-up icon-small"></i></sup>
                                ${buildCounterHtml(counter.number)}
                            </h2>
                        </div>
                    </div>
                    `
											)
											.join("")}
                </div>
            </div>
        </section>
    `;
		}
	);

	eleventyConfig.addJavaScriptFunction("buildCounterHtml", function (number) {
		let html = "";
		number
			.toString()
			.split("")
			.forEach((digit) => {
				html +=
					`<span class="vertical-counter-number" data-to="${digit}"><ul style="transform: translateY(-${digit}0%);">` +
					Array.from({ length: 10 }, (_, i) => `<li>${i}</li>`).join("") +
					`</ul></span>`;
			});
		return html;
	});

	//////////////////
	// SpecialPriceSection
	//////////////////

	/*
   Usage:

{% SpecialPriceSection {
  backgroundUrl: "https://via.placeholder.com/1920x1080.svg",
  items: [
    {
      name: "Chicken breast burger",
      price: "95.00",
      description: "Mint parsley with apple cider vinegar, salt, spices.",
      specialLabel: ""
    },
    {
      name: "Medium cut spicy chips",
      price: "80.00",
      description: "Marinated tomatoes, fragrant curry, tamarillo.",
      specialLabel: "Chef's Special"
    },
    {
      name: "Baked potato pizza",
      price: "80.00",
      description: "Hollandaise sauce, green beans and potato galette.",
      specialLabel: "Today's Special"
    },
    {
      name: "Chicken breast burger",
      price: "80.00",
      description: "Hollandaise sauce, potato and green beans.",
      specialLabel: ""
    }
  ],
  images: [
    "https://via.placeholder.com/1920x1080.png",
    "https://via.placeholder.com/1024x768.jpg"
  ]
} %}
   
*/

	eleventyConfig.addShortcode(
		"SpecialPriceSection",
		function ({ backgroundUrl, items, images }) {
			return `
        <section class="background-position-center background-repeat" style="background-image: url('${backgroundUrl}')">
            <div class="container">
                <div class="row overlap-section mb-50px" style="margin-top: inherit;">
                    <div class="col-12 text-center">
                        <img src="${
													images[0]
												}" alt="Special Price Image" data-bottom-top="transform: translate3d(75px, 0px, 0px);" data-top-bottom="transform: translate3d(-75px, 0px, 0px);" data-no-retina="">
                    </div>
                </div>
                <div class="row align-items-center">
                    <div class="col-lg-5 offset-lg-1 order-lg-2 md-mb-50px xs-mb-30px">
                        <img src="${
													images[1]
												}" class="border-radius-6px w-100" data-bottom-top="transform: translateY(-50px)" data-top-bottom="transform: translateY(50px)" alt="Special Price Detail Image" data-no-retina="">
                    </div>
                    <div class="col-lg-6 order-lg-1">
                        <h4 class="alt-font text-dark-gray ls-minus-1px ps-30px pe-30px mb-30px xs-ps-20px xs-pe-20px">Premium menus</h4>
                        <div class="h-2px bg-dark-gray mb-20px"></div>
                        <ul class="pricing-table-style-13">
                            ${items
															.map(
																(item) => `
                            <li class="flex-column last-paragraph-no-margin overflow-hidden p-0 ${
															item.specialLabel
																? "border border-color-transparent-base-color border-radius-4px"
																: ""
														}">
                                ${
																	item.specialLabel
																		? `<div class="w-100 bg-white text-dark-gray fs-13 text-uppercase fw-700 ps-30px pe-30px xs-ps-20px xs-pe-20px">${item.specialLabel}</div>`
																		: ""
																}
                                <div class="w-100 ps-30px pe-30px pt-10px pb-10px xs-ps-20px xs-pe-20px">
                                    <div class="d-flex align-items-baseline w-100">
                                        <span class="fw-600 text-dark-gray">${
																					item.name
																				}</span>
                                        <div class="ms-auto fw-600 text-dark-gray">$${
																					item.price
																				}</div>
                                    </div>
                                    <p class="fs-16">${item.description}</p>
                                </div>
                            </li>
                            `
															)
															.join("")}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
		}
	);

	//////////////////
	// ProductBuyCardSection
	//////////////////

	/*
   Usage:

{% ProductBuyCardSection {
  products: [
    {
      id: "superior",
      tagline: "Phenomenal view",
      name: "Superior room",
      description: "Discover a private home in the orchard with three bedrooms and baths, featuring a private plunge pool and a three-sided view from the king-size bed.",
      price: "199",
      bookUrl: "demo-hotel-and-resort-room-details.html",
      detailUrl: "demo-hotel-and-resort-room-details.html",
      autoplayDelay: 3000,
      images: [
        "https://via.placeholder.com/510x300",
        "https://via.placeholder.com/510x300",
        "https://via.placeholder.com/510x300"
      ]
    },
    {
      id: "deluxe",
      tagline: "Luxury comfort",
      name: "Deluxe room",
      description: "Spacious room with ocean views, featuring a private balcony and luxurious amenities to enhance your stay.",
      price: "299",
      bookUrl: "demo-hotel-and-resort-room-details.html",
      detailUrl: "demo-hotel-and-resort-room-details.html",
      autoplayDelay: 4000,
      images: [
        "https://via.placeholder.com/510x300",
        "https://via.placeholder.com/510x300",
        "https://via.placeholder.com/510x300"
      ]
    }
  ]
} %}
*/

	eleventyConfig.addShortcode("ProductBuyCardSection", function ({ products }) {
		return `
<section class="background-position-center background-repeat" style="background-image: url('https://via.placeholder.com/1920x1080/cccccc/969696?text=Background+Pattern')">
<div class="container">
    ${products
			.map((product, index) => {
				const isEven = index % 2 === 1;
				return `
    <div class="row g-0 justify-content-center border-radius-6px overflow-hidden mb-8 appear anime-complete" id="${
			product.id
		}" data-anime="{ &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="">
        ${
					isEven
						? `<div class="col-lg-5 bg-very-light-gray">
            <div class="pt-13 pb-12 ps-15 pe-15 lg-p-8 last-paragraph-no-margin">
                <span class="text-base-color fw-500 d-block">${product.tagline}</span>
                <a href="${product.detailUrl}"><h4 class="alt-font text-dark-gray mb-20px ls-minus-1px d-inline-block">${product.name}</h4></a>
                <p class="fs-17">${product.description}</p>
            </div>
            <div class="ps-15 pe-15 pt-5 pb-5 lg-ps-8 lg-pe-8 border-top border-color-transparent-dark-very-light align-items-center d-flex">
                <h4 class="mb-0 fw-700 text-dark-gray">$${product.price}<span class="fs-16 fw-500 align-middle ms-10px">Per night</span></h4>
                <a href="${product.bookUrl}" class="btn btn-medium btn-switch-text btn-base-color btn-box-shadow btn-round-edge d-inline-block align-middle ms-30px xl-ms-25px xs-ms-auto">
                    <span>
                        <span class="btn-double-text" data-text="Book your stay">Book your stay</span>
                    </span>
                </a>
            </div>
        </div>`
						: ""
				}
        <div class="col-lg-7 md-h-400px sm-h-300px text-center">
            <div class="swiper h-100 swiper-pagination-style-3 swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options='{
                "slidesPerView": 1, "spaceBetween": 10, "loop": true, 
                "pagination": { "el": ".slider-four-slide-pagination-${
									product.id
								}", "clickable": true }, 
                "autoplay": { "delay": ${
									product.autoplayDelay
								}, "disableOnInteraction": false }, 
                "navigation": { "nextEl": ".slider-one-slide-next-${
									product.id
								}", "prevEl": ".slider-one-slide-prev-${product.id}" }, 
                "keyboard": { "enabled": true, "onlyInViewport": true }, 
                "breakpoints": { "1400": { "slidesPerView": 1 }, "1200": { "slidesPerView": 1 }, "992": { "slidesPerView": 1 }, "768": { "slidesPerView": 1 } }, 
                "effect": "slide" 
            }'>
                <div class="swiper-wrapper">
                    ${product.images
											.map(
												(image) => `
                    <div class="swiper-slide cover-background" style="background-image: url('${image}'); width: 510px; margin-right: 10px;"></div>
                    `
											)
											.join("")}
                </div>
                <div class="slider-one-slide-prev-${
									product.id
								} bg-dark-gray-transparent-medium h-50px w-50px swiper-button-prev slider-navigation-style-01" tabindex="0" role="button" aria-label="Previous slide"><i class="fa-solid fa-angle-left text-white"></i></div>
                <div class="slider-one-slide-next-${
									product.id
								} bg-dark-gray-transparent-medium h-50px w-50px swiper-button-next slider-navigation-style-01" tabindex="0" role="button" aria-label="Next slide"><i class="fa-solid fa-angle-right text-white"></i></div>
            </div>
        </div>
        ${
					!isEven
						? `<div class="col-lg-5 bg-very-light-gray">
            <div class="pt-13 pb-12 ps-15 pe-15 lg-p-8 last-paragraph-no-margin">
                <span class="text-base-color fw-500 d-block">${product.tagline}</span>
                <a href="${product.detailUrl}"><h4 class="alt-font text-dark-gray mb-20px ls-minus-1px d-inline-block">${product.name}</h4></a>
                <p class="fs-17">${product.description}</p>
            </div>
            <div class="ps-15 pe-15 pt-5 pb-5 lg-ps-8 lg-pe-8 border-top border-color-transparent-dark-very-light align-items-center d-flex">
                <h4 class="mb-0 fw-700 text-dark-gray">$${product.price}<span class="fs-16 fw-500 align-middle ms-10px">Per night</span></h4>
                <a href="${product.bookUrl}" class="btn btn-medium btn-switch-text btn-base-color btn-box-shadow btn-round-edge d-inline-block align-middle ms-30px xl-ms-25px xs-ms-auto">
                    <span>
                        <span class="btn-double-text" data-text="Book your stay">Book your stay</span>
                    </span>
                </a>
            </div>
        </div>`
						: ""
				}
    </div>
    `;
			})
			.join("")}
</div>
</section>
    `;
	});






































//     //////////////////
// // ServiceDetailSection
// //////////////////

// /*
//    Usage:

// {% ServiceDetailSection {
//   heading: "Superior room",
//   description: "Enjoy your most glorious moments",
//   rating: 4.8,
//   reviewer: "Review by Google",
//   rate: "Per night $199",
//   overviewHeading: "Room overview",
//   overviewDetail: "The superior rooms pay tribute to fashion and craftsmanship. The rooms are approximately with views of rue alger and jardin des uileries. The selection and pairing of materials has been carefully chosen to give you a cool experience.",
//   featuresHeading: "Amenities and comforts",
//   features: [
//     "40 inch sony TV",
//     "Wireless internet",
//     "Bluetooth player",
//     "Use of smartphone",
//     "Luggage storage",
//     "Beautiful nature"
//   ],
//   images: [
//     "https://via.placeholder.com/510x300",
//     "https://via.placeholder.com/510x300",
//     "https://via.placeholder.com/510x300"
//   ]
// } %}
// */

// eleventyConfig.addShortcode("ServiceDetailSection", function({ heading, description, rating, reviewer, rate, overviewHeading, overviewDetail, featuresHeading, features, images }) {
//     return `
// <section class="background-position-center background-repeat position-relative pb-0 overflow-hidden">
// <div class="container">
// <div class="row align-items-center mb-50px">
// <div class="col-lg-5 last-paragraph-no-margin md-mb-20px">
// <h3 class="text-dark-gray alt-font ls-minus-1px mb-0">${heading}</h3>
// <p class="ls-05px">${description}</p>
// </div>
// <div class="col-lg-3 col-sm-6 xs-mb-30px">
// <div class="d-flex align-items-center">
// <div class="col-auto text-center"><h2 class="text-dark-gray mb-0 fw-700">${rating.toFixed(1)}</h2></div>
// <div class="col ps-20px">
// <div class="review-star-icon lh-20 fs-18">
// ${Array(Math.floor(rating)).fill('<i class="bi bi-star-fill"></i>').join('')}${Array(5 - Math.floor(rating)).fill('<i class="bi bi-star"></i>').join('')}
// </div>
// <span class="d-block text-dark-gray fw-500">${reviewer}</span>
// </div>
// </div>
// </div>
// <div class="col text-start text-sm-end">
// <h3 class="text-dark-gray fw-700 d-inline-block align-middle mb-5px mt-5px"><span class="fs-20 fw-500 align-middle">${rate}</span></h3>
// <a href="demo-hotel-and-resort-contact.html" class="btn btn-large btn-switch-text btn-base-color btn-box-shadow btn-round-edge ms-25px xs-ms-15px">
// <span>
// <span class="btn-double-text" data-text="Book your stay">Book your stay</span>
// </span>
// </a>
// </div>
// </div>
// <div class="h-2px bg-dark-gray mb-50px"></div>
// <div class="row row-cols-1 row-cols-lg-2 align-items-center mb-8 xs-mb-14">
// <div class="col last-paragraph-no-margin">
// <span class="text-dark-gray fs-26 alt-font d-block mb-10px">${overviewHeading}</span>
// <p class="w-90 md-w-100 md-mb-30px">${overviewDetail}</p>
// </div>
// <div class="col">
// <span class="text-dark-gray fs-26 alt-font d-block mb-15px">${featuresHeading}</span>
// <div class="row row-cols-1 row-cols-md-2">
// <div class="col">
// <div class="row row-cols-1 justify-content-center">
// ${features.slice(0, Math.ceil(features.length / 2)).map(feature => `
// <div class="col icon-with-text-style-08 mb-10px">
// <div class="feature-box feature-box-left-icon-middle overflow-hidden">
// <div class="feature-box-icon feature-box-icon-rounded bg-very-light-gray w-35px h-35px rounded-circle me-15px">
// <i class="fa-solid fa-check fs-15 text-base-color"></i>
// </div>
// <div class="feature-box-content last-paragraph-no-margin">
// <p>${feature}</p>
// </div>
// </div>
// </div>
// `).join('')}
// </div>
// </div>
// <div class="col">
// <div class="row row-cols-1 justify-content-center">
// ${features.slice(Math.ceil(features.length / 2)).map(feature => `
// <div class="col icon-with-text-style-08 mb-10px">
// <div the="feature-box-icon feature-box-icon-rounded bg-very-light-gray w-35px h-35px rounded-circle me-15px">
// <i class="fa-solid fa-check fs-15 text-base-color"></i>
// </div>
// <div class="feature-box-content last-paragraph-no-margin">
// <p>${feature}</p>
// </div>
// </div>
// </div>
// `).join('')}
// </div>
// </div>
// </div>
// </div>
// <div class="row align-items-center">
// <div class="col-12">
// <div class="outside-box-right-40 sm-outside-box-right-0">


// <div class="swiper magic-cursor swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ 'slidesPerView': 1, 'spaceBetween': 30, 'loop': true, 'pagination': { 'el': '.slider-three-slide-pagination', 'clickable': true, 'dynamicBullets': true }, 'autoplay': { 'delay': 3000, 'disableOnInteraction': false }, 'navigation': { 'nextEl': '.slider-three-slide-next', 'prevEl': '.slider-three-slide-prev' }, 'keyboard': { 'enabled': true, 'onlyInViewport': true }, 'breakpoints': { '992': { 'slidesPerView': 3 }, '768': { 'slidesPerView': 2 }, '320': { 'slidesPerView': 1 } }, 'effect': 'slide' }">
// <div class="swiper-wrapper">
// ${images.map(image => `
// <div class="swiper-slide" style="width: 510px; margin-right: 30px;">
// <img src="${image}" class="w-100 border-radius-6px" alt="" data-no-retina>
// </div>
// `).join('')}
// </div>
// <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span></div>
// </div>
// </div>
// </div>
// </div>
// </section>
//     `;
// });


















//////////////////
// ServiceSliderNoControlSection
//////////////////

/*
   Usage:

{% ServiceSliderNoControlSection {
  images: [
    "https://via.placeholder.com/510x300",
    "https://via.placeholder.com/510x300",
    "https://via.placeholder.com/510x300",
    "https://via.placeholder.com/510x300",
    "https://via.placeholder.com/510x300",
    "https://via.placeholder.com/510x300"
  ]
} %}
*/

eleventyConfig.addShortcode("ServiceSliderNoControlSection", function({ images }) {
    return `
<section>
    <div class="row align-items-center">
        <div class="col-12">
            <div class="outside-box-right-40 sm-outside-box-right-0">
                <div class="swiper magic-cursor swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ &quot;slidesPerView&quot;: 1, &quot;spaceBetween&quot;: 30, &quot;loop&quot;: true, &quot;pagination&quot;: { &quot;el&quot;: &quot;.slider-three-slide-pagination&quot;, &quot;clickable&quot;: true, &quot;dynamicBullets&quot;: true }, &quot;autoplay&quot;: { &quot;delay&quot;: 3000, &quot;disableOnInteraction&quot;: false }, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.slider-three-slide-next&quot;, &quot;prevEl&quot;: &quot;.slider-three-slide-prev&quot; }, &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;breakpoints&quot;: { &quot;992&quot;: { &quot;slidesPerView&quot;: 3 }, &quot;768&quot;: { &quot;slidesPerView&quot;: 2 }, &quot;320&quot;: { &quot;slidesPerView&quot;: 1 } }, &quot;effect&quot;: &quot;slide&quot; }">
                    <div class="swiper-wrapper" id="swiper-wrapper-109e17fb8cf6d1116" aria-live="off" style="transition-duration: 0ms; transform: translate3d(-2700px, 0px, 0px); transition-delay: 0ms;">
                        ${images.map(image => `
                        <div class="swiper-slide" style="width: 510px; margin-right: 30px;" role="group" aria-label="1 / 6" data-swiper-slide-index="0">
                            <img src="${image}" class="w-100 border-radius-6px" alt="" data-no-retina="">
                        </div>
                        `).join('')}
                    </div>
                    <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
                </div>
            </div>
        </div>
    </div>
</section>
    `;
});







//////////////////
// ProductFolioSection
//////////////////

/*
   Usage:

{% ProductFolioSection {
  items: [
    {
      imageUrl: "https://via.placeholder.com/510x300",
      pageUrl: "demo-scattered-portfolio-single-project-creative.html",
      title: "Tailoring",
      category: "Branding"
    },
    {
      imageUrl: "https://via.placeholder.com/510x300",
      pageUrl: "demo-scattered-portfolio-single-project-creative.html",
      title: "Designblast",
      category: "Photography"
    },
    {
      imageUrl: "https://via.placeholder.com/510x300",
      pageUrl: "demo-scattered-portfolio-single-project-creative.html",
      title: "Outward",
      category: "Identity"
    },
    {
      imageUrl: "https://via.placeholder.com/510x300",
      pageUrl: "demo-scattered-portfolio-single-project-creative.html",
      title: "Violator",
      category: "Marketing"
    },
    {
      imageUrl: "https://via.placeholder.com/510x300",
      pageUrl: "demo-scattered-portfolio-single-project-creative.html",
      title: "Potato",
      category: "Branding"
    },
    {
      imageUrl: "https://via.placeholder.com/510x300",
      pageUrl: "demo-scattered-portfolio-single-project-creative.html",
      title: "Treato",
      category: "Web"
    }
  ]
} %}
*/

eleventyConfig.addShortcode("ProductFolioSection", function({ items }) {
    return `
<section class="py-0">
<div class="container">
<div class="row">
${items.map((item, index) => {
    let colClass = index % 2 === 0 ? 'col-xl-4 col-lg-5' : 'col-xl-7 col-lg-7';
    let offsetClass = index % 2 === 0 ? '' : 'offset-xl-1';
    return `
    <div class="${colClass} ${offsetClass} filter-content">
    <ul class="portfolio-simple portfolio-wrapper grid grid-4col xxl-grid-4col xl-grid-4col lg-grid-4col md-grid-2col sm-grid-2col xs-grid-1col text-center">
    <li class="grid-sizer"></li>
    <li class="grid-item grid-item-single transition-inner-all">
    <div class="portfolio-box">
    <div class="portfolio-image bg-base-color">
    <a href="${item.pageUrl}">
    <img src="${item.imageUrl}" alt="" data-no-retina="">
    </a>
    </div>
    <div class="portfolio-caption pt-35px pb-35px sm-pt-20px sm-pb-20px">
    <a href="${item.pageUrl}" class="text-black text-black-hover fw-600 fs-24 alt-font font-style-italic">${item.title}</a>
    <span class="d-inline-block align-middle w-10px separator-line-1px bg-light-gray ms-5px me-5px"></span>
    <div class="d-inline-block">${item.category}</div>
    </div>
    </div>
    </li>
    </ul>
    </div>
    `;
}).join('')}
</div>
</div>
</section>
    `;
});


















//////////////////
// CategoryCirclesSliderSection
//////////////////

/*
   Usage:

{% CategoryCirclesSliderSection {
  headline: "A radically original composition.",
  items: [
    { imageUrl: "https://via.placeholder.com/265x265", title: "Aluminium", subtitle: "Cups" },
    { imageUrl: "https://via.placeholder.com/265x265", title: "Stainless", subtitle: "Frame" },
    { imageUrl: "https://via.placeholder.com/265x265", title: "Digital", subtitle: "Control" },
    { imageUrl: "https://via.placeholder.com/265x265", title: "Canopy", subtitle: "Spanning" }
  ]
} %}
*/

eleventyConfig.addShortcode("CategoryCirclesSliderSection", function({ headline, items }) {
    return `
        <section id="design" class="overflow-hidden bg-black background-position-center-top background-no-repeat pt-15 sm-pt-50px position-relative" style="background-image: url('https://via.placeholder.com/1920x1080')">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="col-xl-8 text-center position-relative sm-mb-40px" data-top-bottom="transform: scale(1); filter: opacity(1)" data-bottom-top="transform: scale(1.3); filter: opacity(0)">
                        <span class="fs-110 md-fs-90 xs-fs-80 text-white fw-700 ls-minus-5px">${headline}</span>
                    </div>
                </div>
                <div class="mt-13">
                    <div class="row row-cols-1 justify-content-center">
                        <div class="col appear anime-complete" data-anime="{ &quot;translateY&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 50, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                            <div class="swiper magic-cursor drag-cursor light swiper-initialized swiper-horizontal" data-slider-options="{ &quot;slidesPerView&quot;: 1, &quot;spaceBetween&quot;: 70, &quot;loopedSlides&quot;: true, &quot;autoplay&quot;: { &quot;delay&quot;: 3000, &quot;disableOnInteraction&quot;: false }, &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;breakpoints&quot;: { &quot;1400&quot;: { &quot;slidesPerView&quot;:7 }, &quot;992&quot;: { &quot;slidesPerView&quot;: 4, &quot;spaceBetween&quot;: 80  }, &quot;768&quot;: { &quot;slidesPerView&quot;: 3, &quot;spaceBetween&quot;: 60 }, &quot;576&quot;: { &quot;slidesPerView&quot;: 2, &quot;spaceBetween&quot;: 45 } }, &quot;effect&quot;: &quot;slide&quot; }">
                                <div class="swiper-wrapper text-center" id="swiper-wrapper-07f8421344862c8c" aria-live="off">
                                    ${items.map(item => `
                                        <div class="swiper-slide" style="width: 265px; margin-right: 60px;">
                                            <div class="overflow-hidden position-relative">
                                                <img class="border-radius-100" src="${item.imageUrl}" alt="${item.title}" data-no-retina="">
                                            </div>
                                            <div class="mt-25px">
                                                <span class="text-white fs-20 lh-24 fw-600 d-block">${item.title}</span>
                                                <span>${item.subtitle}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
});


//////////////////
// PurchaseProductSection
//////////////////

/*
   Usage:



{% PurchaseProductSection {
    headline: "Choose the perfect product for you",
    products: [
      {
        mainImage: "https://via.placeholder.com/450x300",
        thumbImage: "https://via.placeholder.com/150x150",
        color: "Silver"
      },
      {
        mainImage: "https://via.placeholder.com/450x300",
        thumbImage: "https://via.placeholder.com/150x150",
        color: "Grey"
      },
      {
        mainImage: "https://via.placeholder.com/450x300",
        thumbImage: "https://via.placeholder.com/150x150",
        color: "Pink"
      },
      {
        mainImage: "https://via.placeholder.com/450x300",
        thumbImage: "https://via.placeholder.com/150x150",
        color: "Blue"
      }
    ],
    price: "999",
    purchaseUrl: "https://www.amazon.com/",
    features: ["Secure", "Free", "Contactless delivery"]
  } %}
  

  */


eleventyConfig.addShortcode("PurchaseProductSection", function({ headline, products, price, purchaseUrl, features }) {
    return `
        <section id="pricing" class="bg-gradient-very-light-gray">
            <div class="container">
                <div class="row justify-content-center mb-4">
                    <div class="col-xl-7 col-lg-9 text-center">
                        <h2 class="h1 fw-800 text-dark-gray ls-minus-3px">${headline}</h2>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-lg-4 row-cols-sm-2 position-relative justify-content-center">
                    ${products.map(product => `
                    <div class="col text-center">
                        <img class="w-70" src="${product.mainImage}" alt="" data-no-retina="">
                        <div class="mt-30px">
                            <img src="${product.thumbImage}" alt="" data-no-retina="">
                            <span class="fs-18 fw-700 text-dark-gray mt-10px d-block">${product.color}</span>
                        </div>
                    </div>
                    `).join('')}
                </div>
                <div class="row justify-content-center mt-6 sm-mt-11">
                    <div class="col-md-4 p-0">
                        <span class="bg-dark-gray w-100 fs-30 p-7 sm-p-5 fw-700 text-white text-center d-inline-block">Just $${price}</span>
                    </div>
                    <div class="col-md-4 p-0">
                        <a href="${purchaseUrl}" target="_blank" class="btn btn-gradient-purple-pink w-100 fs-30 border-0 p-7 sm-p-5 fw-700 text-uppercase-inherit">Purchase now</a>
                    </div>
                    <div class="col-12 mt-30px">
                        <ul class="list-style-05 text-center text-uppercase ls-1px fs-16 fw-500">
                            ${features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
});









//////////////////
// ProductCVPPercentSection
//////////////////

/*
   Usage:



{% ProductCVPPercentSection {
  heading: "We create highly unique digital media experiences.",
  description: {
    intro: "Our team is committed to delivering measurable results and achieving tangible success.",
    detail: "With a client base exceeding 10,000 our agency has established itself as a trusted and reliable partner in delivering exceptional services."
  },
  mainImage: "https://via.placeholder.com/1920x1080",
  stats: [
    { label: "Business growth", value: 98, color: "orange" },
    { label: "New technology", value: 85, color: "blue" }
  ],
  clientTrust: "10k+ people trusting the agency."
} %}

  */


  eleventyConfig.addShortcode("ProductCVPPercentSection", function({ heading, description, mainImage, stats, clientTrust }) {
    return `
        <section class="py-0">
            <div class="container">
                <div class="row align-items-center position-relative">
                    <div class="col-lg-6">
                        <div class="outside-box-left-20 md-outside-box-left-0 overflow-hidden position-relative" data-parallax-liquid="true" data-parallax-transition="2" data-parallax-position="top" style="transform: translateY(128.855px) scale(1);">
                            <div class="liquid-parallax" data-parallax-liquid="true" data-parallax-position="bottom" data-parallax-scale="1.1" data-parallax-scale-fraction="0.0001" style="transform: translateY(-266.413px) scale(1.1);">
                                <img class="w-100" src="${mainImage}" alt="" data-no-retina="">
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-5 col-lg-6 offset-xl-1 z-index-9 md-mt-50px appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateX&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 300, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 100, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                        <h1 class="text-dark-gray alt-font mb-50px fw-600 ls-minus-2px md-mb-25px outside-box-left-15 md-outside-box-left-0 word-break-normal md-w-80 sm-w-100">${heading}</h1>
                        <p class="fs-20 fw-500 ls-minus-05px text-dark-gray mb-15px">${description.intro}</p>
                        <p class="w-90 md-w-100 mb-35px">${description.detail}</p>
                        <div class="progress-bar-style-02 mb-40px">
                            <div class="progress mb-15px border-radius-50px fw-600 fs-11 lh-12 text-white bg-white">
                                <div class="progress-bar bg-gradient-orange-transparent m-0 appear" role="progressbar" aria-valuenow="${stats[0].value}" aria-valuemin="0" aria-valuemax="100" style="width: ${stats[0].value}%;">
                                    <span class="progress-bar-percent text-orange fw-600">${stats[0].value}%</span>
                                </div>
                                <div class="progress-bar-title text-uppercase">${stats[0].label}</div>
                            </div>
                            <div class="progress mb-15px border-radius-50px fw-600 fs-11 lh-12 text-white bg-white">
                                <div class="progress-bar bg-gradient-blue-transparent m-0 appear" role="progressbar" aria-valuenow="${stats[1].value}" aria-valuemin="0" aria-valuemax="100" style="width: ${stats[1].value}%;">
                                    <span class="progress-bar-percent text-tropical-blue fw-600">${stats[1].value}%</span>
                                </div>
                                <div class="progress-bar-title text-uppercase">${stats[1].label}</div>
                            </div>
                        </div>
                        <div class="pt-20px pb-20px ps-30px pe-30px xs-p-15px border border-color-extra-medium-gray border-radius-6px mb-15px icon-with-text-style-08 w-90 lg-w-100">
                            <div class="feature-box feature-box-left-icon-middle d-inline-flex align-middle">
                                <div class="feature-box-icon me-10px">
                                    <i class="bi bi-people icon-very-medium text-dark-gray"></i>
                                </div>
                                <div class="feature-box-content">
                                    <span class="alt-font fs-19 ls-minus-05px fw-600 text-dark-gray d-block lh-26">${clientTrust}</span>
                                </div>
                            </div>
                        </div>
                        <p class="fs-13 mb-0">We are excited for our work and how it <span class="text-dark-gray text-decoration-line-bottom">positively</span> impacts clients.</p>
                    </div>
                </div>
            </div>
        </section>
    `;
});






//////////////////
// BrandValuesSection
//////////////////

/*
   Usage:

{% BrandValuesSection {
  heading: "We work with brands and businesses to ensure they shine.",
  contentBlocks: [
    {
      heading: "Successfully finished projects with creativity.",
      text: "We value each and every human life placed our hands constantly work towards meeting the expectations of our customers."
    },
    {
      heading: "Work together for better branding solutions.",
      text: "We value each and every human life placed our hands constantly work towards meeting the expectations of our customers."
    },
    {
      heading: "Committed to deliver unique digital media.",
      text: "We value each and every human life placed our hands constantly work towards meeting the expectations of our customers."
    }
  ]
} %}

*/

eleventyConfig.addShortcode("BrandValuesSection", function({ heading, contentBlocks }) {
    return `
        <section class="pb-0">
            <div class="container">
                <div class="row">
                    <div class="col-lg-5 md-mb-20px sm-mb-0 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [15, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                        <h3 class="text-dark-gray fw-600 ls-minus-2px alt-font">${heading}</h3>
                    </div>
                    <div class="col-lg-7 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [15, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                        ${contentBlocks.map(block => `
                            <div class="row">
                                <div class="col-md-5">
                                    <div class="fs-19 fw-600 text-dark-gray w-90 xl-w-100 sm-mb-10px">${block.heading}</div>
                                </div>
                                <div class="col-md-7 last-paragraph-no-margin">
                                    <p>${block.text}</p>
                                </div>
                            </div>
                            <div class="separator-line-1px border-bottom border-color-extra-medium-gray mt-35px mb-35px"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>
    `;
});





//////////////////
// AboutSection
//////////////////

/*
   Usage:

{% AboutSection {
  mainTitle: "about agency",
  subTitle: "We are work on delivering unique visual solutions.",
  imageUrl: "https://via.placeholder.com/1920x1080"
} %}

*/

eleventyConfig.addShortcode("AboutSection", function({ mainTitle, subTitle, imageUrl }) {
    return `
    <section class="p-0 top-space-margin position-relative overflow-hidden" style="margin-top: 2em;">
<div class="container-fluid p-0 h-100 position-relative">
    <div class="row g-0">
        <div class="col-xl-4 col-lg-5 d-flex justify-content-center align-items-center ps-10 xxl-ps-6 xl-ps-4 md-ps-4 sm-ps-0 position-relative order-2 order-lg-1 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;:0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
            <div class="vertical-title-center align-items-center justify-content-center flex-shrink-0 w-75px sm-w-50px">
                <h1 class="title fs-15 alt-font text-dark-gray fw-700 text-uppercase ls-1px text-uppercase d-flex w-auto align-items-center m-0 appear" data-fancy-text="{ &quot;opacity&quot;: [0, 1], &quot;translateY&quot;: [50, 0], &quot;filter&quot;: [&quot;blur(20px)&quot;, &quot;blur(0px)&quot;], &quot;string&quot;: [&quot;${mainTitle}&quot;], &quot;duration&quot;: 400, &quot;delay&quot;: 0, &quot;speed&quot;: 50, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                

                    <span class="splitting anime-text" data-splitting="chars">
                    ${mainTitle}
            </span>
                </h1>
            </div>
            <div class="border-start border-color-extra-medium-gray ps-40px sm-ps-20px position-relative z-index-9">
                <h2 class="text-dark-gray fw-600 alt-font outside-box-right-10 xl-outside-box-right-15 lg-outside-box-right-20 md-me-0 sm-mb-0 ls-minus-3px">${subTitle}</h2>
            </div>
        </div>
        <div class="col-xl-8 col-lg-7 position-relative order-1 order-lg-2 md-mb-50px">
            <div class="overflow-hidden position-relative">
                <div class="w-100 appear" data-anime="{ &quot;effect&quot;: &quot;slide&quot;, &quot;direction&quot;: &quot;lr&quot;, &quot;color&quot;: &quot;#f7f7f7&quot;, &quot;duration&quot;: 1000, &quot;delay&quot;: 0 }" style="position: relative;">
                    <img src="${imageUrl}" alt="" class="w-100 liquid-parallax" data-parallax-liquid="true" data-parallax-position="top" data-parallax-scale="1.05" style="transform: translateY(-13.0677px) scale(1.048); opacity: 1;" data-no-retina="">
                </div>
            </div>
        </div>
    </div>
</div>
</section>
    `;
});






//////////////////
// NumberedServiceSection
//////////////////

/*
   Usage:

{% NumberedServiceSection {
  sections: [
    {
      number: "01",
      title: "Branding solutions",
      description: "We are excited for our work and how it positively impacts clients. With over 12 years of experience, we have been constantly providing excellent web solutions which is a best in-class experience for our clients.",
      points: [
        { text: "Brand strategy" },
        { text: "Video production" },
        { text: "Research and testing" },
        { text: "Usability consulting" },
        { text: "Art direction" },
        { text: "Graphic design" },
        { text: "Content creation" },
        { text: "Web development" }
      ],
      imageUrls: [
        "https://via.placeholder.com/600x400",
        "https://via.placeholder.com/600x400"
      ]
    },
    {
      number: "02",
      title: "Digital Marketing",
      description: "Leveraging digital channels to enhance your business presence with measurable results.",
      points: [
        { text: "SEO Optimization" },
        { text: "Pay Per Click" },
        { text: "Email Marketing" },
        { text: "Social Media Marketing" },
        { text: "Content Marketing" },
        { text: "Affiliate Marketing" },
        { text: "Online PR" },
        { text: "Inbound Marketing" }
      ],
      imageUrls: [
        "https://via.placeholder.com/600x400",
        "https://via.placeholder.com/600x400"
      ]
    }
  ]
} %}

*/

eleventyConfig.addShortcode("NumberedServiceSection", function({ sections }) {
    return `
<section class="pt-0">
    <div class="container">
        ${sections.map((section, index) => `
        <div class="row mb-8">
            <div class="col-lg-2 col-md-2 text-md-end">
                <span class="fs-130 xl-fs-100 md-fs-80 lh-100 md-lh-80 alt-font fw-700 text-sliding-line bg-extra-medium-gray">${section.number}</span>
            </div>
            <div class="col-xl-3 col-lg-4 col-md-8 md-mt-15px appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;:0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                <h3 class="alt-font fw-600 mb-0 text-dark-gray ls-minus-2px">${section.title}</h3>
            </div>
            <div class="col-lg-6 offset-xl-1 md-mt-20px appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;:0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                <p>${section.description}</p>
                <div class="row">
                    <div class="col-xl-5 col-md-6">
                        <ul class="p-0 m-0 list-style-02 text-dark-gray fw-500 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;rotateY&quot;:[100, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 800, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                            ${section.points.slice(0, 4).map(point => `<li><i class="fa-solid fa-plus fs-12 me-10px"></i>${point.text}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="col-xl-5 col-md-6">
                        <ul class="p-0 m-0 list-style-02 text-dark-gray fw-500 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;rotateY&quot;:[100, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 800, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                            ${section.points.slice(4).map(point => `<li><i class="fa-solid fa-plus fs-12 me-10px"></i>${point.text}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-8 sm-mb-30px skrollable skrollable-between" data-bottom-top="transform: translate3d(0, -30px, 0px);" data-top-bottom="transform: translate3d(0, 30px, 0px);">
                <div class="position-relative appear" data-anime="{ &quot;effect&quot;: &quot;slide&quot;, &quot;direction&quot;: &quot;lr&quot;, &quot;color&quot;: &quot;#f7f7f7&quot;, &quot;duration&quot;: 1000, &quot;delay&quot;: 0 }" style="position: relative;">
                    <img src="${section.imageUrls[0]}" alt="" data-no-retina="" style="opacity: 1;">
                </div>
            </div>
            <div class="col-md-4  skrollable skrollable-between" data-bottom-top="transform: translate3d(0, 30px, 0px);" data-top-bottom="transform: translate3d(0, -30px, 0px);">
                <div class="position-relative appear" data-anime="{ &quot;effect&quot;: &quot;slide&quot;, &quot;direction&quot;: &quot;rl&quot;, &quot;color&quot;: &quot;#f7f7f7&quot;, &quot;duration&quot;: 1000, &quot;delay&quot;: 0 }" style="position: relative;">
                    <img src="${section.imageUrls[1]}" alt="" data-no-retina="" style="opacity: 1;">
                </div>
            </div>
        </div>
        `).join('')}
    </div>
</section>
    `;
});




























//////////////////
// ChoosePriceSaaSSection
//////////////////

/*
   Usage:

{% ChoosePriceSaaSSection {
  plans: [
    {
      title: "Starter",
      description: "Individual",
      price: "29",
      features: ["Marketing strategy", "Competitive work analysis", "Social media share audit", "Monthly management"],
      featureIcons: ["check", "check", "x", "x"],
      link: "#",
      planType: "standard"
    },
    {
      title: "Professional",
      description: "Business",
      price: "39",
      features: ["Marketing strategy", "Competitive work analysis", "Social media share audit", "Monthly management"],
      featureIcons: ["check", "check", "check", "x"],
      link: "#",
      planType: "popular"
    },
    {
      title: "Enterprise",
      description: "Corporate",
      price: "59",
      features: ["Marketing strategy", "Competitive work analysis", "Social media share audit", "Monthly management"],
      featureIcons: ["check", "check", "check", "check"],
      link: "#",
      planType: "standard"
    }
  ]
} %}

*/

eleventyConfig.addShortcode("ChoosePriceSaaSSection", function({ plans }) {
    return `
<section class="pt-4">
    <div class="container">
        <div class="row align-items-end pricing-table-style-05 g-0 mb-6 justify-content-center">
            ${plans.map(plan => `
            <div class="col-lg-4 col-md-8 md-mb-30px appear anime-complete" data-anime="{ &quot;translateX&quot;: [${plan.planType === 'popular' ? '0' : '50'}, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="">
                <div class="${plan.planType === 'popular' ? 'bg-dark-gray' : 'border-radius-6px'} position-relative overflow-hidden">
                    ${plan.planType === 'popular' ? '<div class="p-10px fw-700 fs-14 text-white bg-dark-gray text-uppercase text-center">Popular</div>' : ''}
                    <div class="pricing-header pt-45px pb-10px ${plan.planType === 'popular' ? 'bg-white' : ''} border-radius-6px text-center position-relative top-minus-3px">
                        <span class="ps-25px pe-25px mb-15px text-uppercase text-dark-gray fs-14 lh-34 fw-600 border-radius-100px bg-white border border-color-extra-medium-gray box-shadow-medium-bottom d-inline-block">${plan.title}</span>
                        <h5 class="fw-700 mb-0 text-dark-gray alt-font">${plan.description}</h5>
                        <div class="pricing-body pt-35px">
                            <ul class="p-0 m-0 list-style-02 text-center text-md-start">
                                ${plan.features.map((feature, index) => `
                                <li class="pt-15px pb-15px ps-12 pe-12 border-top border-color-extra-medium-gray text-dark-gray lg-ps-10 lg-pe-10">
                                    <span class="d-flex align-self-center justify-content-center bg-${plan.featureIcons[index] === 'check' ? 'green' : 'red'} h-20px w-20px border-radius-100 me-10px">
                                        <i class="bi bi-${plan.featureIcons[index]} align-self-center text-white fs-14"></i>
                                    </span>${feature}
                                </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="row align-items-center pt-25px pb-25px">
                        <div class="col text-center last-paragraph-no-margin d-flex align-items-center justify-content-center">
                            <h3 class="alt-font text-${plan.planType === 'popular' ? 'white' : 'dark-gray'} mb-0 me-15px fw-700 ls-minus-2px">$${plan.price}</h3>
                            <p class="w-120px ${plan.planType === 'popular' ? 'text-white opacity-5' : 'fs-15 lh-22 text-start'}">Per user/month billed annually*</p>
                        </div>
                    </div>
                    <div class="pricing-footer ps-12 pe-12 pb-8 text-center">
                        <a href="${plan.link}" class="btn btn-large btn-${plan.planType === 'popular' ? 'white' : 'dark-gray'} btn-box-shadow btn-hover-animation-switch btn-round-edge w-100 text-transform-none mb-15px fw-700">
                            <span>
                                <span class="btn-text">Join this plan </span>
                                <span class="btn-icon"><i class="feather icon-feather-arrow-right"></i></span>
                                <span class="btn-icon"><i the="feather icon-feather-arrow-right"></i></span>
                            </span>
                        </a>
                        <span class="fs-16 ${plan.planType === 'popular' ? 'text-white opacity-5 fw-300' : ''}">Cancel anytime</span>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>
    `;
});





//////////////////
// CustomerLoveSection
//////////////////

/*
   Usage:

{% CustomerLoveSection {
  backgroundUrl: "https://via.placeholder.com/1920x1080/vertical-line-bg-medium-gray.svg",
  title: "Loved by most valuable customers",
  testimonials: [
    {
      image: "https://via.placeholder.com/150",
      content: "Every element is designed beautifully and perfect!",
      detail: "These are great headphones for music and movies for the price. I have never owned a big-money pair of headphones. It's a good pair of headphones.",
      author: "Shoko Mugikura",
      position: "Google Design"
    },
    {
      image: "https://via.placeholder.com/150",
      content: "Simple and easy to integrate and build the website!",
      detail: "I was surprised at the sound quality from these phones right out of the box. I'm a fan of the sound and normally use with my home equipment.",
      author: "Herman Miller",
      position: "Apple Design"
    }
  ],
  reviewCount: "3,583",
  reviewSourceLogo: "https://via.placeholder.com/50",
  reviewSourceUrl: "https://www.amazon.com/"
} %}

*/

eleventyConfig.addShortcode("CustomerLoveSection", function({ backgroundUrl, title, testimonials, reviewCount, reviewSourceLogo, reviewSourceUrl }) {
    return `
<section id="review" class="background-position-center-top" style="background-image: url('${backgroundUrl}')">
    <div class="container">
        <div class="row justify-content-center mb-1">
            <div class="col-xl-7 col-lg-9 col-md-10 text-center appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [50, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                <h2 class="h1 fw-800 text-dark-gray ls-minus-3px" style="">${title}</h2>
            </div>
        </div>
        <div class="row">
            <div class="col-12 text-center appear anime-complete" data-anime="{ &quot;rotateX&quot;: [-40, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 100, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="">
                <div class="swiper swiper-horizontal-3d pt-8 pb-5 lg-pt-10 lg-pb-10 md-pt-12 sm-pt-21 sm-pb-11 swiper-pagination-bottom testimonials-style-04 swiper-coverflow swiper-3d swiper-initialized swiper-horizontal swiper-watch-progress" data-slider-options="{ &quot;loop&quot;: true, &quot;slidesPerView&quot;: 1,&quot;centeredSlides&quot;:true,&quot;effect&quot;:&quot;coverflow&quot;,&quot;coverflowEffect&quot;:{&quot;rotate&quot;:0,&quot;stretch&quot;:100,&quot;depth&quot;:150,&quot;modifier&quot;:1.5,&quot;slideShadows&quot;:true}, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.swiper-button-next-nav.slider-navigation-style-04&quot;, &quot;prevEl&quot;: &quot;.swiper-button-previous-nav.slider-navigation-style-04&quot; }, &quot;autoplay&quot;: { &quot;delay&quot;: 5000, &quot;disableOnInteraction&quot;: false }, &quot;pagination&quot;: { &quot;el&quot;: &quot;.swiper-pagination-04&quot;, &quot;clickable&quot;: true, &quot;dynamicBullets&quot;: true }, &quot;breakpoints&quot;: { &quot;768&quot;: { &quot;slidesPerView&quot;: 2 } } }">
                    <div class="swiper-wrapper" id="swiper-wrapper-581d28197277a7e8" aria-live="off">
                        ${testimonials.map(testimonial => `
                        <div class="swiper-slide bg-white border-radius-4px" role="group" aria-label="slide" style="width: 465px;">
                            <div class="position-relative ps-13 pe-13 md-ps-10 md-pe-10 sm-ps-7 sm-pe-7 pt-20 pb-10 lg-pt-22 md-pt-30 sm-pt-20">
                                <img alt="" src="${testimonial.image}" class="absolute-middle-center top-0px rounded-circle w-150px xs-w-100px border border-color-white box-shadow-extra-large border-8" data-no-retina="">
                                <div class="testimonials-content">
                                    <span class="text-dark-gray fs-18 lh-30 fw-600 mb-5px d-block">${testimonial.content}</span>
                                    <p class="mb-25px">${testimonial.detail}</p>
                                </div>
                                <div class="testimonials-author fs-19 mb-5px text-gradient-dark-purple-watermelon fw-700 d-inline-block">${testimonial.author}</div>
                                <div class="testimonials-position fs-15 lh-20">${testimonial.position}</div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-12 text-center appear anime-complete" data-anime="{ &quot;translateY&quot;: [50, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="">
                <div class="text-center bg-dark-gray text-white fs-16 lh-36 border-radius-30px d-inline-block ps-20px pe-20px align-middle me-10px mt-10px mb-10px"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i the bi-star-fill"></i><i class="bi bi-star-fill"></i></div>
                <h6 class="text-dark-gray fw-400 mb-0 d-inline-block align-middle ls-minus-1px">Check all <span class="fw-700">${reviewCount}</span> readers reviews on <a href="${reviewSourceUrl}" target="_blank"><img src="${reviewSourceLogo}" alt="" data-no-retina=""></a></h6>
            </div>
        </div>
    </div>
</section>
    `;
});




//////////////////
// NumberedLetteredBigMenu
//////////////////

/*
   Usage:

{% NumberedLetteredBigMenu {
  items: [
    {
      number: "01",
      name: "cropo",
      link: "demo-design-agency-single-project-simple.html",
      imageUrl: "https://via.placeholder.com/1920x1080"
    },
    {
      number: "02",
      name: "grino",
      link: "demo-design-agency-single-project-simple.html",
      imageUrl: "https://via.placeholder.com/1920x1080"
    },
    {
      number: "03",
      name: "adidas",
      link: "demo-design-agency-single-project-simple.html",
      imageUrl: "https://via.placeholder.com/1920x1080"
    },
    
  ]
} %}

*/



eleventyConfig.addShortcode("NumberedLetteredBigMenu", function({ items }) {
    return `
<section class="big-section threeD-letter-menu d-flex align-items-center">
    <div class="container">
        <div class="row align-items-center position-relative z-index-9">
            ${items.map(item => `
            <div class="col-auto menu-item pe-50px position-relative">
                <div class="fs-14 fw-500 opacity-6 text-dark-gray position-absolute top-15px left-minus-5px">${item.number}</div>
                <a href="${item.link}" class="menu-item-text fs-150 md-fs-120 lh-100 text-dark-gray alt-font ls-minus-3px">
                <span data-splitting="chars"> ${item.name}</span>
                </a>
                <div class="hover-reveal d-none d-xl-block">
                    <div class="hover-reveal__inner">
                        <div class="hover-reveal__img" style="background-image: url(${item.imageUrl});">
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>
    `;
});











///////////////////
// WorkImagesSection
///////////////////

/*
   Usage:

   {% WorkImagesSection {
    items: [
      {
        link: "demo-design-agency-single-project-simple.html",
        imageUrl: "https://via.placeholder.com/1920x1080",
        title: "Pixflow",
        category: ["digital", "selected"] 
      },
      {
        link: "demo-design-agency-single-project-simple.html",
        imageUrl: "https://via.placeholder.com/1920x1080",
        title: "Skoda",
        category: ["web", "digital"]
      },
      {
        link: "demo-design-agency-single-project-simple.html",
        imageUrl: "https://via.placeholder.com/1920x1080",
        title: "Tailoring",
        category: ["branding", "selected"]
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("WorkImagesSection", function({ items }) {
    return `
<section class="pt-0 md-pb-0">
    <div class="container-fluid">
        <div class="row g-0">
            <div class="col-12 filter-content appear anime-complete" data-anime="{ &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;:0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="">
                <ul class="portfolio-clean portfolio-wrapper grid grid-4col xxl-grid-4col xl-grid-4col lg-grid-4col md-grid-2col sm-grid-2col xs-grid-1col gutter-large" style="position: relative; height: 1602.05px;">
                    <li class="grid-sizer"></li>
                    ${items.map(item => `
                    <li class="grid-item ${item.category.join(' ')} transition-inner-all" style="position: absolute;">
                        <a href="${item.link}">
                            <div class="portfolio-box">
                                <div class="portfolio-image">
                                    <img src="${item.imageUrl}" alt="" data-no-retina="">
                                </div>
                                <div class="portfolio-hover d-flex justify-content-end align-items-end flex-column ps-35px pe-35px pt-5px pb-5px lg-ps-15px lg-pe-15px">
                                    <div class="d-flex align-items-center justify-content-start flex-wrap text-left w-100">
                                        <div class="fs-20 fw-600 text-dark-gray portfolio-title ls-minus-05px">${item.title}</div>
                                        <i class="line-icon-Arrow-OutRight icon-large align-middle text-dark-gray"></i>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    </div>
</section>
    `;
});





///////////////////
// HistorySection
///////////////////

/*
   Usage:

   {% HistorySection {
    backgroundImageUrl: "url('https://via.placeholder.com/1920x1080')",
    aboutTitle: "About resorts",
    mainTitle: "Relax at the luxury resorts around the entire world.",
    description: "A design-led approach guides the team, implementing practices, products and services that are thoughtful and environmentally sound. Family of professionals that creates intelligent designs that help the face of hospitality.",
    aboutUrl: "demo-hotel-and-resort-about-us.html",
    phoneLink: "tel:1800222000",
    phoneText: "1 800 222 000",
    historyStartYear: "1995",
    images: [
      { imageUrl: "https://via.placeholder.com/600x400" },
      { imageUrl: "https://via.placeholder.com/600x400" }
    ],
    marqueeTexts: [
      "Our hotel has been present for over 20 years",
      "We make the best for all our customers",
      "The resort is built in and around an 18 acres",
      "Sustainable and meaningful ecosystem of hospitality"
    ]
   } %}
*/

eleventyConfig.addShortcode("HistorySection", function({ backgroundImageUrl, aboutTitle, mainTitle, description, aboutUrl, phoneLink, phoneText, historyStartYear, images, marqueeTexts }) {
    return `
    <section class="background-position-center background-repeat" style="background-image: ${backgroundImageUrl}">
    <div class="container">
        <div class="row align-items-center mb-12 md-mb-17 xs-mb-25">
          <div class="col-lg-5 md-mb-50px " data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;opacity&quot;: [0, 1], &quot;rotateY&quot;: [-90, 0], &quot;rotateZ&quot;: [-10, 0], &quot;translateY&quot;: [80, 0], &quot;translateZ&quot;: [50, 0], &quot;staggervalue&quot;: 200, &quot;duration&quot;: 800, &quot;delay&quot;: 200, &quot;easing&quot;: &quot;easeOutCirc&quot; }">
            <span class="mb-10px text-base-color fw-500 d-block">${aboutTitle}</span>
                <h2 class="alt-font text-dark-gray ls-minus-2px">${mainTitle}</h2>
                <p class="w-80 xl-w-100 mb-35px xs-mb-10px">${description}</p>
                <div class="d-inline-block w-100">
                    <a href="${aboutUrl}" class="btn btn-extra-large btn-switch-text btn-dark-gray btn-box-shadow btn-round-edge d-inline-block align-middle me-30px xs-me-10px xs-mt-20px">
                        <span>
                            <span class="btn-double-text" data-text="About resort">About resort</span>
                        </span>
                    </a>
                    <div class="fs-20 fw-600 d-inline-block align-middle text-dark-gray xs-mt-20px"><a href="${phoneLink}"><i class="bi bi-telephone-outbound text-medium-gray icon-small me-10px"></i>${phoneText}</a></div>
                </div>
            </div>
            <div class="col-lg-6 position-relative offset-lg-1">
              <span
              class="fs-90 position-absolute left-60px md-left-100px sm-left-70px xs-left-10px top-90px xs-top-50px text-dark-gray fw-700 z-index-1 skrollable skrollable-between "
              data-bottom-top="transform: translateY(50px) scale(1,1)"
              data-top-bottom="transform: translateY(-50px) scale(1,1)"
              data-anime='{ "opacity": [0,1], "duration": 600, "delay": 1500, "staggervalue": 300, "easing": "easeOutQuad" }'
              style="transform: translateY(-13.1661px) scale(1, 1)"
              >
              <span class="fs-15 fw-600 d-table lh-16 text-uppercase text-medium-gray">Started in</span>${historyStartYear}</span>
                <div class="w-75 overflow-hidden position-relative xs-w-80 border-radius-4px float-end "   data-anime='{ "effect": "slide", "color": "#A0875B", "direction":"rl", "easing": "easeOutQuad", "duration": 600, "delay":400}'           style="position: relative">
                    <img class="w-100" src="${images[0].imageUrl}" alt="" data-no-retina=""   style="opacity: 1">
                </div>
                <div class="position-absolute left-minus-70px md-left-15px bottom-minus-50px w-55 overflow-hidden skrollable skrollable-between " 
                data-bottom-top="transform: translateY(50px)"
                 data-top-bottom="transform: translateY(-50px)"
                 data-anime='{ "effect": "slide", "color": "#ffffff", "direction":"lr", "easing": "easeOutQuad", "duration": 600, "delay":500}'
                 style="transform: translateY(-4.54444px); position: relative"
             >
                    <img class="w-100 border-radius-4px" src="${images[1].imageUrl}" alt="" data-no-retina=""           style="opacity: 1">
                </div>
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <div class="row position-relative">
            <div class="col swiper swiper-width-auto feather-shadow text-center swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options='{
                "slidesPerView": "auto", "spaceBetween": 0, "centeredSlides": true, "speed": 10000, "loop": true, "pagination": { "el": ".slider-four-slide-pagination-2", "clickable": false }, "allowTouchMove": false, "autoplay": { "delay": 1, "disableOnInteraction": false }, "navigation": { "nextEl": ".slider-four-slide-next-2", "prevEl": ".slider-four-slide-prev-2" }, "keyboard": { "enabled": true, "onlyInViewport": true }, "effect": "slide" }'>
                <div class="swiper-wrapper marquee-slide" style="transition-duration: 10000ms; transform: translate3d(-1471.22px, 0px, 0px);" id="swiper-wrapper-e9e779eb9e66aae4" aria-live="off">
                    ${marqueeTexts.map(text => `<div class="swiper-slide" role="group" aria-label="1 / ${marqueeTexts.length}">
                        <div class="fs-28 sm-fs-22 alt-font ls-minus-05px text-dark-gray"><span class="w-10px h-10px border border-radius-100 border-color-base-color d-inline-block ms-50px me-50px md-ms-30px md-me-30px"></span>${text}</div>
                    </div>`).join('')}
                </div>
            </div>
        </div>
    </div>
  </section>
    `;
  });
  



















///////////////////
// StepsTimelineSection
///////////////////

/*
   Usage:

   {% StepsTimelineSection {
    processTitle: "Process cycle",
    mainTitle: "Business <span class='text-highlight'>timeline<span class='bg-base-color opacity-3 h-10px bottom-10px'></span></span>",
    steps: [
      {
        number: "01",
        title: "Business founded",
        description: "Lorem ipsum is simply text the printing typesetting standard dummy."
      },
      {
        number: "02",
        title: "Build new office",
        description: "Lorem ipsum is simply text the printing typesetting standard dummy."
      },
      {
        number: "03",
        title: "Relocates headquarter",
        description: "Lorem ipsum is simply text the printing typesetting standard dummy."
      },
      {
        number: "04",
        title: "Revenues of millions",
        description: "Lorem ipsum is simply text the printing typesetting standard dummy."
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("StepsTimelineSection", function({ processTitle, mainTitle, steps }) {
    return `
<section class="position-relative half-section pt-0">
    <div class="container">
        <div class="row justify-content-center mb-1">
            <div class="col-lg-6 text-center appear " data-anime="{ 'el': 'childs', 'translateY': [30, 0], 'opacity': [0,1], 'duration': 600, 'delay': 0, 'staggervalue': 300, 'easing': 'easeOutQuad' }">
                <div class="bg-base-color fw-600 text-white text-uppercase ps-20px pe-20px fs-12 border-radius-100px d-inline-block mb-15px">${processTitle}</div>
                <h2 class="fw-700 alt-font text-dark-gray ls-minus-1px">${mainTitle}</h2>
            </div>
        </div>
        <div class="row row-cols-auto row-cols-xl-4 row-cols-sm-2 position-relative appear anime-child anime-complete" data-anime="{ 'el': 'childs', 'translateX': [50, 0], 'opacity': [0,1], 'duration': 600, 'delay':100, 'staggervalue': 150, 'easing': 'easeOutQuad' }">
            ${steps.map((step, index) => `
            <div class="col ${index % 2 === 0 ? 'align-self-start' : 'align-self-end mt-40px lg-mt-0'} xs-mb-40px" style="">
                <div class="feature-box text-start ps-30px pe-30px sm-ps-20px sm-pe-20px">
                    <div class="feature-box-icon position-absolute left-0px top-0px">
                        <h1 class="alt-font fs-110 text-outline text-outline-width-1px text-outline-color-dark-gray fw-800 ls-minus-1px opacity-2 mb-0">${step.number}</h1>
                    </div>
                    <div class="feature-box-content last-paragraph-no-margin pt-30 lg-pt-60px sm-pt-40px">
                        <span class="alt-font text-dark-gray fs-20 d-inline-block fw-600 mb-10px">${step.title}</span>
                        <p>${step.description}</p>
                        <span class="w-60px h-2px bg-dark-gray d-inline-block"></span>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>
    `;
});


















///////////////////
// MissionVisionSection
///////////////////

/*
   Usage:

   {% MissionVisionSection {
    imageUrl: "images/demo-medical-about-02.jpg",
    videoUrl: "https://www.youtube.com/watch?v=cfXHhfNy7tU",
    missionTitle: "Our mission and vision",
    sections: [
      {
        number: "01",
        title: "Our hospital mission",
        content: "Velit officia consequat duis enim velit mollit amet minim mollit non."
      },
      {
        number: "02",
        title: "Our hospital vision",
        content: "Velit officia consequat duis enim velit mollit amet minim mollit non.",
        expanded: true
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("MissionVisionSection", function({ imageUrl, videoUrl, missionTitle, sections }) {
    return `
<section>
    <div class="container">
        <div class="row align-items-center justify-content-center">
            <div class="col-lg-6 md-mb-50px position-relative appear anime-complete" data-anime="{ &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="">
                <div class="atropos atropos-rotate-touch" data-atropos="" data-atropos-perspective="2450">
                    <div class="atropos-scale">
                        <div class="atropos-rotate">
                            <div class="atropos-inner">
                                <img src="${imageUrl}" alt="" class="border-radius-6px w-100" data-no-retina="">
                                <span class="atropos-highlight" style="transform: translate3d(0px, 0px, 0px);"></span>
                            </div>
                            <span class="atropos-shadow" style="transform: translate3d(0px, 0px, -50px) scale(1);"></span>
                        </div>
                    </div>
                </div>
                <div class="absolute-middle-center text-white-space-nowrap z-index-9">
                    <a href="${videoUrl}" class="btn btn-extra-large btn-white left-icon btn-box-shadow btn-rounded popup-youtube"><i class="fa-brands fa-youtube"></i>See our virtual tour</a>
                </div>
            </div>
            <div class="col-xl-5 offset-xl-1 col-lg-6 appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
                <span class="fs-18 fw-600 text-dark-gray mb-20px d-flex align-items-center" style=""><span class="text-center w-60px h-60px d-flex justify-content-center align-items-center rounded-circle bg-light-sea-green-transparent-light align-middle me-15px"><i class="bi bi-trophy text-base-color fs-20"></i></span>${missionTitle}</span>
                <h2 class="fw-800 text-dark-gray ls-minus-2px mb-40px md-mb-35px" style="">Latest medicine, exceptional care.</h2>
                <div class="accordion accordion-style-05" id="accordion-style-05" style="">
                    ${sections.map(section => `
                    <div class="accordion-item bg-white ${section.expanded ? 'active-accordion' : ''}">
                        <h2 class="number alt-font mb-0 text-base-color fw-600 text-outline text-outline-color-base-color">${section.number}</h2>
                        <div class="accordion-header">
                            <a href="#" data-bs-toggle="collapse" data-bs-target="#accordion-style-05-${section.number}" aria-expanded="${section.expanded ? 'true' : 'false'}" data-bs-parent="#accordion-style-05" class="${section.expanded ? '' : 'collapsed'}">
                                <div class="accordion-title fs-18 position-relative pe-20px text-dark-gray fw-600 mb-0">${section.title}</div>
                            </a>
                        </div>
                        <div id="accordion-style-05-${section.number}" class="accordion-collapse collapse ${section.expanded ? 'show' : ''}" data-bs-parent="#accordion-style-05" style="">
                            <div class="accordion-body last-paragraph-no-margin">
                                <p>${section.content}</p>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
</section>
    `;
});








  


  eleventyConfig.addShortcode("ProductCardSliderWithPricesSection", function({ title, subtitle, items }) {
    const sliderItems = items.map((item, index) => `
      <div class="swiper-slide ${index === 0 ? 'swiper-slide-active' : ''}" style="width: 438px; margin-right: 30px;">
        <div class="box-shadow-extra-large services-box-style-01 hover-box last-paragraph-no-margin border-radius-4px overflow-hidden">
          <div class="position-relative box-image">
            <img src="${item.imageUrl}" alt="" data-no-retina="">
          </div>
          <div class="bg-white">
            <div class="ps-50px pe-50px pt-35px sm-p-35px sm-pb-0">
              <a href="${item.link}" class="d-inline-block fs-19 primary-font fw-500 text-dark-gray mb-5px">${item.name}</a>
              <p>${item.description}</p>
            </div>
            <div class="border-top border-color-extra-medium-gray pt-20px pb-20px ps-50px pe-50px mt-30px sm-ps-35px sm-pe-35px position-relative">
              <div class="fs-17"><span class="text-dark-gray fs-26 alt-font me-5px">$${item.price}</span> Per month</div>
              <a href="${item.link}" class="d-flex justify-content-center align-items-center w-55px h-55px lh-55 rounded-circle bg-dark-gray position-absolute right-40px top-minus-30px"><i class="bi bi-arrow-right-short text-white icon-very-medium"></i></a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  
    return `
      <section class="pt-3 bg-very-light-gray overflow-hidden sm-pt-50px">
        <div class="container">
          <div class="row justify-content-center mb-1">
            <div class="col-lg-7 text-center appear anime-child anime-complete">
              <span class="fs-15 alt-font fw-600 text-base-color text-uppercase ls-3px">${subtitle}</span>
              <h3 class="alt-font text-dark-gray ls-minus-1px">${title}</h3>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 position-relative">
              <div class="swiper magic-cursor swiper-initialized swiper-horizontal swiper-backface-hidden">
                <div class="swiper-wrapper pt-20px pb-20px">${sliderItems}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  });
  





  //////////////////
// AchievementsSection
//////////////////

/*
   Usage:

   {% AchievementsSection {
    title: "Powerful achievement",
    images: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150"
    ]
   } %}
*/

eleventyConfig.addShortcode("AchievementsSection", function({ title, images }) {
    const imageElements = images.map(imageUrl => `
        <div class="col-6 col-lg-2 col-md-3 col-sm-6 sm-mb-30px text-center" style="">
            <img src="${imageUrl}" alt="" data-no-retina="">
        </div>
    `).join('');

    return `
        <div class="row justify-content-center align-items-center appear anime-child anime-complete" data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateX&quot;: [50, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
            <div class="col-xl-3 col-lg-4 md-mb-40px text-center text-lg-start" style="">
                <h4 class="alt-font text-dark-gray mb-0 fw-500">${title} <span class="fw-700 font-style-italic text-decoration-line-bottom-medium">achievement</span></h4>
            </div>
            ${imageElements}
        </div>
    `;
});



////////////////////
// CategoriesRectanglesSections
//////////////////

/*
   Usage Example:

   {% CategoriesRectanglesSections {
    categories: [
      {
        image: "images/demo-jewellery-store-06.jpg",
        title: "Bangles",
        link: "demo-jewellery-store-shop.html"
      },
      {
        image: "images/demo-jewellery-store-07.jpg",
        title: "Pendants",
        link: "demo-jewellery-store-shop.html"
      },
      {
        image: "images/demo-jewellery-store-08.jpg",
        title: "Chain",
        link: "demo-jewellery-store-shop.html"
      },
      {
        image: "images/demo-jewellery-store-01.jpg",
        title: "Earrings",
        link: "demo-jewellery-store-shop.html",
        large: true
      },
      {
        image: "images/demo-jewellery-store-02.jpg",
        title: "Rings",
        link: "demo-jewellery-store-shop.html"
      },
      {
        image: "images/demo-jewellery-store-04.jpg",
        title: "Necklace",
        link: "demo-jewellery-store-shop.html",
        large: true
      },
      {
        image: "images/demo-jewellery-store-03.jpg",
        title: "Bracelet",
        link: "demo-jewellery-store-shop.html"
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("CategoriesRectanglesSections", function(data) {
    const { categories } = data;
    return `
  <section>
  <div class="container">
  <div class="row">
  <div class="col-12">
  <ul class="portfolio-wrapper shop-category-02 shop-grid grid grid-3col xxl-grid-3col md-grid-2col sm-grid-1col xs-grid-1col gutter-extra-large text-center appear anime-child anime-complete" data-anime="{&quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [0, 0], &quot;perspective&quot;: [1200,1200], &quot;scale&quot;: [1.1, 1], &quot;rotateX&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 800, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }" style="position: relative; height: 900.729px;">
  <li class="grid-sizer"></li>
  ${categories.map((category, index) => `
  <li class="grid-item ${category.large ? 'large-size' : ''}" style="position: absolute; left: ${33.3286 * (index % 3)}%; top: ${300.243 * Math.floor(index / 3)}px; transition-behavior: normal; transition-timing-function: ease;">
  <div class="category-box bg-dark-gray">
  <div class="category-image">
  <img src="${category.image}" alt="" data-no-retina="">
  </div>
  <div class="category-title absolute-middle-left">
  <h3 class="text-white alt-font fw-600 mb-0 text-shadow-large">${category.title}</h3>
  </div>
  <div class="category-hover-content d-flex flex-column align-items-center justify-content-center bg-base-color p-40px lg-p-25px">
  <h3 class="title text-dark-gray alt-font fw-600 position-relative z-index-1 ls-minus-1px">${category.title}<span class="absolute-middle-center text-light-orange z-index-minus-1 fs-150 opacity-6">${category.title.charAt(0)}</span></h3>
  <a class="fs-14 fw-500 text-dark-gray text-uppercase position-absolute z-index-1 bottom-25px ls-05px" href="${category.link}">View collection</a>
  </div>
  </div>
  </li>
  `).join('')}
  </ul>
  </div>
  </div>
  </div>
  </section>
  `;
  });
  




//////////////////
// SectionWiseFaqSection
//////////////////

/*
   Usage:

   {% SectionWiseFaqSection {
    categories: [
      {
        id: "tab_seven1",
        title: "General",
        faqs: [
          { question: "Can I order over the phone?", answer: "Lorem ipsum is simply dummy text of the printing and typesetting industry." }
        ]
      },
      {
        id: "tab_seven2",
        title: "Shopping information",
        faqs: [
          { question: "I am having difficulty placing an order?", answer: "Lorem ipsum is simply dummy text of the printing and typesetting industry." }
        ]
      }
    ]
   } %}


*/

eleventyConfig.addShortcode("SectionWiseFaqSection", function({ categories }) {
    const tabs = categories.map((cat, index) => `
        <li class="nav-item" role="presentation">
            <a class="nav-link ${index === 0 ? 'active' : ''}" data-bs-toggle="tab" href="#${cat.id}" aria-selected="${index === 0 ? 'true' : 'false'}" role="tab">
                <span>${cat.title}</span>
                <span class="bg-hover bg-base-color"></span>
            </a>
        </li>
    `).join('');

    const tabContents = categories.map((cat, index) => `
        <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" id="${cat.id}" role="tabpanel">
            <div class="accordion accordion-style-02" id="accordion-${cat.id}" data-active-icon="icon-feather-minus" data-inactive-icon="icon-feather-plus">
                ${cat.faqs.map((faq, idx) => `
                    <div class="accordion-item ${idx === 0 ? 'active-accordion' : ''}">
                        <div class="accordion-header border-bottom border-color-extra-medium-gray">
                            <a href="#" data-bs-toggle="collapse" data-bs-target="#accordion-${cat.id}-${idx}" aria-expanded="${idx === 0 ? 'true' : 'false'}" data-bs-parent="#accordion-${cat.id}">
                                <div class="accordion-title mb-0 position-relative text-dark-gray">
                                    <i class="feather icon-feather-${idx === 0 ? 'minus' : 'plus'}"></i><span class="fw-500 fs-18">${faq.question}</span>
                                </div>
                            </a>
                        </div>
                        <div id="accordion-${cat.id}-${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" data-bs-parent="#accordion-${cat.id}">
                            <div class="accordion-body last-paragraph-no-margin border-bottom border-color-extra-medium-gray">
                                <p>${faq.answer}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    return `
        <section>
            <div class="container">
                <div class="row">
                    <div class="col-xl-3 col-lg-4 tab-style-07 md-mb-20px">
                        <ul class="nav nav-tabs justify-content-center border-0 text-left alt-font fw-500" role="tablist">
                            ${tabs}
                        </ul>
                    </div>
                    <div class="col-lg-8 offset-xl-1 lg-ps-50px md-ps-15px">
                        <div class="tab-content h-100">
                            ${tabContents}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
});













//////////////////
// TopTabBarHeaderSection
//////////////////

/*
   Usage:

   {% TopTabBarHeaderSection {
    freeDeliveryText: "Free Delivery on orders over £120. Don't miss discount.",
    shopNowLink: "demo-decor-store-shop.html",
    customerServiceLink: "demo-decor-store-contact.html",
    findStoreLink: "demo-decor-store-contact.html",
    languageOptions: [
      { name: "English", flag: "usa.png" },
      { name: "France", flag: "france.png" },
      { name: "Russian", flag: "russian.png" },
      { name: "Spain", flag: "spain.png" }
    ]
   } %}
*/

eleventyConfig.addShortcode("TopTabBarHeaderSection", function({
    freeDeliveryText, shopNowLink, customerServiceLink, findStoreLink, languageOptions
}) {
    const languageDropdownItems = languageOptions.map(option => `
        <li>
            <a href="javascript:void(0);" title="${option.name}">
                <span class="icon-country">
                    <img src="images/country-flag-16X16/${option.flag}" alt="" data-no-retina>
                </span>
                ${option.name}
            </a>
        </li>
    `).join('');

    return `

        <div class="header-top-bar top-bar-light bg-white disable-fixed border-bottom border-color-transparent-dark-very-light" style="top: 0px;">
            <div class="container-fluid">
                <div class="row h-45px align-items-center m-0">
                    <div class="col-lg-7 col-md-8 text-center text-md-start">
                        <div class="fs-13 text-dark-gray alt-font fw-600">
                            ${freeDeliveryText} <a href="${shopNowLink}" class="text-dark-gray fw-700 text-decoration-line-bottom">Shop now</a>
                        </div>
                    </div>
                    <div class="col-lg-5 col-md-4 text-end d-none d-md-flex">
                        <a href="${customerServiceLink}" class="widget fs-13 text-dark-gray fw-600 me-25px md-me-15px text-dark-gray">
                            <i class="feather icon-feather-phone-call"></i>Customer service
                        </a>
                        <a href="${findStoreLink}" class="widget fs-13 text-dark-gray alt-font me-25px fw-600 d-none d-lg-inline-block">
                            <i class="feather icon-feather-map-pin"></i>Find our store
                        </a>
                        <div class="header-language-icon widget fs-13 alt-font fw-600">
                            <div class="header-language dropdown">
                                <a href="javascript:void(0);" class="text-dark-gray">
                                    <i class="feather icon-feather-globe"></i>English
                                </a>
                                <ul class="language-dropdown alt-font">
                                    ${languageDropdownItems}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
});


  









////////////////////
// numberedTimelineSection
//////////////////

/*
   Usage Example:

   {% numberedTimelineSection {
    timelineEvents: [
      {
        title: "First time we met",
        description: "Lorem ipsum consectetur adipiscing elit eiusmod.",
        year: "2018"
      },
      {
        title: "Our first date",
        description: "Lorem ipsum consectetur adipiscing elit eiusmod.",
        year: "2019"
      },
      {
        title: "Our marriage proposal",
        description: "Lorem ipsum consectetur adipiscing elit eiusmod.",
        year: "2020"
      },
      {
        title: "Our engagement",
        description: "Lorem ipsum consectetur adipiscing elit eiusmod.",
        year: "2023"
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("numberedTimelineSection", function(data) {
    const { timelineEvents } = data;
    return `
  <section class="py-0 border-top lg-border-top-0 border-color-medium-gray bg-very-light-gray position-relative">
  <div class="container">
  <div class="row row-cols-1 row-cols-lg-4 row-cols-sm-2 g-0 appear anime-child anime-complete" data-anime="{&quot;el&quot;: &quot;childs&quot;, &quot;translateX&quot;: [40, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 300, &quot;delay&quot;: 300, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
  
  ${timelineEvents.map(event => `
  <div class="col process-step-style-06 hover-box md-mb-50px" style="">
  <div class="process-step-icon-box position-relative top-minus-14px">
  <span class="progress-step-separator bg-medium-gray w-100 separator-line-1px"></span>
  <div class="step-box d-flex align-items-center justify-content-center bg-base-color border-radius-100 w-25px h-25px">
  <span class="w-9px h-9px bg-white border-radius-100"></span>
  </div>
  </div>
  <span class="d-block fs-19 text-dark-gray fw-600 mt-20px mb-5px">${event.title}</span>
  <p class="w-80 xl-w-90 md-w-80 xs-w-100 mb-20px">${event.description}</p>
  <div class="fs-80 alt-font text-outline text-outline-color-westar-grey">${event.year}</div>
  </div>
  `).join('')}
  
  </div>
  </div>
  </section>
  `;
  });
  




  ////////////////////
// FeaturedCategoriesSection
//////////////////

/*
   Usage Example:

   {% FeaturedCategoriesSection {
    categories: [
      {
        image: "https://via.placeholder.com/150",
        link: "demo-decor-store-shop.html",
        count: "02",
        title: "Lamp"
      },
      {
        image: "https://via.placeholder.com/150",
        link: "demo-decor-store-shop.html",
        count: "03",
        title: "Stool"
      },
      {
        image: "https://via.placeholder.com/150",
        link: "demo-decor-store-shop.html",
        count: "05",
        title: "Chair"
      },
      {
        image: "https://via.placeholder.com/150",
        link: "demo-decor-store-shop.html",
        count: "03",
        title: "Cabinet"
      },
      {
        image: "https://via.placeholder.com/150",
        link: "demo-decor-store-shop.html",
        count: "08",
        title: "Light"
      },
      {
        image: "https://via.placeholder.com/150",
        link: "demo-decor-store-shop.html",
        count: "04",
        title: "Sofa"
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("FeaturedCategoriesSection", function(data) {
    const { categories } = data;
    return `
    <section>
    <div class="container container position-relative z-index-9">
  <div class="row align-items-center mb-6 mt-7 xs-mb-30px xs-mt-35px">
  <div class="col-xl-2 col-lg-3 md-mb-40px">
  <div class="feature-box feature-box-left-icon-middle mb-5px">
  <div class="feature-box-icon me-5px">
  <i class="bi bi-heart-fill text-red fs-13"></i>
  </div>
  <div class="feature-box-content">
  <span class="d-inline-block fs-16 fw-500 alt-font text-dark-gray">On demand</span>
  </div>
  </div>
  <h6 class="mb-0 fw-700 alt-font text-dark-gray">Featured categories</h6>
  </div>
  <div class="col-xl-10 col-lg-9">
  <div class="row row-cols-2 row-cols-md-6 row-cols-sm-3 justify-content-center align-items-center">
  ${categories.map(category => `
  <div class="col categories-style-01 text-center sm-mb-30px">
  <div class="categories-box">
  <div class="icon-box position-relative mb-10px">
  <a href="${category.link}"><img src="${category.image}" alt="" data-no-retina=""></a>
  <div class="count-circle d-flex align-items-center justify-content-center w-35px h-35px bg-base-color text-white rounded-circle alt-font fw-600 fs-12">${category.count}</div>
  </div>
  <a href="${category.link}" class="alt-font fw-600 fs-17 text-dark-gray text-dark-gray-hover">${category.title}</a>
  </div>
  </div>
  `).join('')}
  </div>
  </div>
  </div>
  </div>
  </section>
  `;
  });

  









////////////////////
// ExploreCategoriesSquareRectangleMixSection
//////////////////

/*
   Usage Example:

   {% ExploreCategoriesSquareRectangleMixSection {
    categories: [
      { image: "https://via.placeholder.com/500x500", title: "Wooden classic table", link: "demo-decor-store-shop.html", large: true },
      { image: "https://via.placeholder.com/500x250", title: "Pottery products", link: "demo-decor-store-shop.html", large: false },
      { image: "https://via.placeholder.com/500x250", title: "Florence compact", link: "demo-decor-store-shop.html", large: false }

    ]
   } %}
*/

eleventyConfig.addShortcode("ExploreCategoriesSquareRectangleMixSection", function(data) {
    const { categories } = data;
    let positionTop = 0;
    let rowIndex = 0;
  

    return `
    <section class="position-relative pt-0 overflow-hidden">
    <div class="container container position-relative z-index-9">
  <div class="row g-0">
      <div class="col-12 filter-content">
      <ul class="shop-wrapper shop-grid grid grid-2col xxl-grid-2col xl-grid-2col lg-grid-2col md-grid-1col sm-grid-1col xs-grid-1col gutter-large text-center" style="position: relative; height: 519.652px;">
      <li class="grid-sizer"></li>
      ${categories.map((category, index) => {
        const leftPosition = (index % 2) * 50;
        if (index % 2 === 0 && index > 0) {
          rowIndex++;
        }
        const topPosition = rowIndex * (category.large ? 519.652 : 259.826);
  
        return `
        <li class="grid-item" style="position: absolute; left: ${leftPosition}%; top: ${topPosition}px;">
          <div class="shop-box position-relative overflow-hidden">
            <div class="shop-image">
              <img src="${category.image}" alt="" data-no-retina="">
            </div>
            <div class="position-absolute top-0 left-0 w-100 h-100 d-flex align-items-${category.large ? 'end' : 'center'} justify-content-start text-start">
              <div class="${category.large ? 'p-14 sm-p-10 w-80 lg-w-90 md-w-65 xs-w-300px' : 'p-11 xs-p-8 w-60 md-w-50 xs-w-230px'}">
                <h${category.large ? '3' : '5'} class="alt-font text-dark-gray ls-minus-1px mb-${category.large ? '30px xs-mb-25px' : '25px xs-mb-20px'}">${category.title} <span class="fw-700">${category.title.split(' ')[1]}</span></h${category.large ? '3' : '5'}>
                <a href="${category.link}" class="btn btn-dark-gray btn-${category.large ? 'large' : 'small'} btn-switch-text btn-round-edge btn-box-shadow">
                  <span>
                    <span class="btn-double-text" data-text="Explore category">Explore category</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </li>
        `;
      }).join('')}
      </ul>
      </div>
  </div>
  </div>
  </section>
  `;
  });
  






  ////////////////////
// ScrollProgressVerticalsSection
//////////////////

/*
   Usage Example:

   {% ScrollProgressVerticalsSection %}
*/

eleventyConfig.addShortcode("ScrollProgressVerticalsSection", function() {
    return `
  <div class="scroll-progress d-none d-xxl-block">
  <a href="#" class="scroll-top" aria-label="scroll">
  <span class="scroll-text">Scroll</span><span class="scroll-line"><span class="scroll-point" style="height: 0%;"></span></span>
  </a>
  </div>
  `;
  });

  



  ////////////////////
// LeftToRightScrollerLightSection
//////////////////

/*
   Usage Example:

   {% LeftToRightScrollerLightSection {
    direction: "left", // "left" or "right"
    items: [
      { text: "graphic.", index: "1" },
      { text: "print.", index: "2" },
      { text: "illustration.", index: "3" },
      { text: "packaging.", index: "4" },
      { text: "web.", index: "5" },
      { text: "development.", index: "6" },
      { text: "branding.", index: "7" },
      { text: "branding.", index: "0" } 
    ]
   } %}
*/

eleventyConfig.addShortcode("LeftToRightScrollerLightSection", function(data) {
    const { items, direction } = data;
    const translateDirection = direction === "right" ? "2325.38px" : "-2325.38px"; // Adjust the translate3d value based on direction
    return `
  <section class="overflow-hidden position-relative half-section overlap-height pb-0" style="height: 295px;">
  <div class="container-fluid overlap-gap-section">
  <div class="row position-relative">
  <div class="col swiper swiper-width-auto text-center pb-30px sm-pb-0px swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ &quot;slidesPerView&quot;: &quot;auto&quot;, &quot;spaceBetween&quot;:60, &quot;speed&quot;: 8000, &quot;loop&quot;: true, &quot;autoplay&quot;: { &quot;delay&quot;:0, &quot;disableOnInteraction&quot;: false }, &quot;allowTouchMove&quot;: false, &quot;effect&quot;: &quot;slide&quot; }">
  <div class="swiper-wrapper marquee-slide" id="swiper-wrapper-c180843c81994f46" aria-live="off" style="transition-duration: 8000ms; transform: translate3d(${translateDirection}, 0px, 0px);">
  ${items.map(item => `
  <div class="swiper-slide" role="group" aria-label="${item.index + 1} / ${items.length}" style="margin-right: 60px;" data-swiper-slide-index="${item.index}">
  <div class="fs-180 xl-fs-120 sm-fs-80 text-extra-medium-gray fw-600 ls-minus-8px sm-ls-minus-4px word-break-normal">${item.text}</div>
  </div>
  `).join('')}
  </div>
  <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
  </div>
  </div>
  </div>
  </section>
  `;
  });
  






  ////////////////////
// RightToLeftScrollerDarkSection
//////////////////

/*
   Usage Example:

   {% RightToLeftScrollerDarkSection {
    direction: "right", // "right" or "left" to control the scroll direction
    items: [
      { text: "theme.", index: "5" },
      { text: "agency.", index: "6" },
      { text: "digital.", index: "7" },
      { text: "photography.", index: "0" },
      { text: "packaging.", index: "1" },
      { text: "digital.", index: "2" },
      { text: "interface.", index: "3" },
      { text: "development.", index: "4" }
    ]
   } %}
*/

eleventyConfig.addShortcode("RightToLeftScrollerDarkSection", function(data) {
    const { items, direction } = data;
    const reverseDirection = direction === "left" ? false : true;
    return `
  <section class="bg-base-color bg-sliding-line position-relative pb-0">
  <div class="container-fluid overlap-section" style="margin-top: -165px;">
  <div class="row position-relative">
  <div class="col swiper swiper-width-auto text-center pb-30px sm-pb-0px swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options='{ "slidesPerView": "auto", "spaceBetween": 50, "speed": 8000, "loop": true, "autoplay": { "delay":0, "disableOnInteraction": false, "reverseDirection": ${reverseDirection} }, "allowTouchMove": false, "effect": "slide" }'>
  <div class="swiper-wrapper marquee-slide" id="swiper-wrapper-881091584c61028db6" aria-live="off" style="transition-duration: 8000ms; transform: translate3d(0px, 0px, 0px);">
  ${items.map(item => `
  <div class="swiper-slide" role="group" aria-label="${item.index + 1} / ${items.length}" style="margin-right: 50px;" data-swiper-slide-index="${item.index}">
  <div class="fs-150 xl-fs-120 sm-fs-80 text-black fw-600 ls-minus-5px sm-ls-minus-4px word-break-normal">${item.text}</div>
  </div>
  `).join('')}
  </div>
  <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span></div>
  </div>
  </div>
  </section>
  `;
  });




  
  



  ////////////////////
// CategoryAndProductSliderSection
//////////////////

/*
   Usage Example:

   {% CategoryAndProductSliderSection {
    promo: {
      image: "https://via.placeholder.com/800x400",
      title: "Lounge collection",
      subtitle: "Save up to 50% off",
      link: "demo-decor-store-shop.html"
    },
    products: [
      {
        image: "https://via.placeholder.com/200x200",
        link: "demo-decor-store-single-product.html",
        title: "Wooden cabinet",
        originalPrice: "$50.00",
        salePrice: "$23.00"
      },
      {
        image: "https://via.placeholder.com/200x200",
        link: "demo-decor-store-single-product.html",
        title: "Modern chair",
        originalPrice: "$40.00",
        salePrice: "$18.00"
      },
      {
        image: "https://via.placeholder.com/200x200",
        link: "demo-decor-store-single-product.html",
        title: "Classic stools",
        originalPrice: "$56.00",
        salePrice: "$24.00"
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("CategoryAndProductSliderSection", function(data) {
    const { promo, products } = data;
    return `
  <section class="py-0 overflow-hidden">
  <div class="container-fluid p-0">
  <div class="row g-0">
  <div class="col-md-8 cover-background" style="background-image:url('${promo.image}')">
  <div class="pt-13 pb-13 pe-5 w-40 xl-w-45 lg-w-55 md-w-65 sm-w-50 xs-w-270px float-end">
  <span class="fs-15 fw-700 text-dark-gray text-uppercase mb-20px xs-mb-15px d-inline-block text-decoration-line-bottom-medium">${promo.subtitle}</span>
  <h1 class="alt-font fw-400 text-dark-gray mb-40px lg-mb-35px xs-mb-25px ls-minus-1px">${promo.title} <span class="fw-700">collection</span></h1>
  <a href="${promo.link}" class="btn btn-dark-gray btn-extra-large btn-switch-text btn-round-edge btn-box-shadow">
  <span>
  <span class="btn-double-text" data-text="Explore category">Explore category</span>
  </span>
  </a>
  </div>
  </div>
  <div class="col-md-4">
  <div class="swiper position-relative h-100 swiper-fade swiper-initialized swiper-horizontal swiper-watch-progress swiper-backface-hidden" data-slider-options="{ &quot;slidesPerView&quot;: 1, &quot;loop&quot;: true, &quot;allowTouchMove&quot;: true, &quot;autoplay&quot;: { &quot;delay&quot;: 3000, &quot;disableOnInteraction&quot;: false }, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.slider-one-slide-next-1&quot;, &quot;prevEl&quot;: &quot;.slider-one-slide-prev-1&quot; }, &quot;effect&quot;: &quot;fade&quot; }">
  <div class="swiper-wrapper">
  ${products.map(product => `
  <div class="swiper-slide cover-background h-100 text-center" style="background-image: url('https://via.placeholder.com/200x200');">
  <a href="${product.link}">
  <img src="${product.image}" alt="" data-no-retina="">
  </a>
  <div class="position-absolute bottom-70px xs-bottom-25px w-100 left-0 text-center ls-minus-05px">
  <a href="${product.link}" class="text-dark-gray alt-font fs-20 fw-600">${product.title}</a>
  <div class="d-block">
  <div class="d-inline-block align-middle fs-18 fw-600 text-dark-gray"><del class="me-10px">${product.originalPrice}</del>${product.salePrice}</div>
  </div>
  </div>
  </div>
  `).join('')}
  </div>
  <div class="slider-one-slide-prev-1 swiper-button-prev slider-navigation-style-06" tabindex="0" role="button" aria-label="Previous slide"><i class="bi bi-arrow-left icon-extra-medium text-dark-gray"></i></div>
  <div class="slider-one-slide-next-1 swiper-button-next slider-navigation-style-06" tabindex="0" role="button" aria-label="Next slide"><i class="bi bi-arrow-right icon-extra-medium text-dark-gray"></i></div>
  <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
  </div>
  </div>
  </div>
  </div>
  </section>
  `;
  });

  


  



  

  ////////////////////
// CleanPricingTableSection
//////////////////

/*
   Usage Example:

   {% CleanPricingTableSection {
    plans: [
      {
        name: "Standard",
        price: "20",
        features: [
          { name: "Marketing strategy", included: true },
          { name: "Competitive work analysis", included: false },
          { name: "Social media share audit", included: false }
        ],
        link: "#"
      },
      {
        name: "Business",
        price: "24",
        features: [
          { name: "Marketing strategy", included: true },
          { name: "Competitive work analysis", included: true },
          { name: "Social media share audit", included: false }
        ],
        link: "#"
      },
      {
        name: "Ultimate",
        price: "30",
        features: [
          { name: "Marketing strategy", included: true },
          { name: "Competitive work analysis", included: true },
          { name: "Social media share audit", included: true }
        ],
        link: "#"
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("CleanPricingTableSection", function(data) {
    const { plans } = data;
    return `
    <section>
  <div class="row align-items-center justify-content-center pricing-table-style-06 mt-8 mb-8 " data-anime="{ &quot;el&quot;: &quot;childs&quot;, &quot;translateX&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 600, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 300, &quot;easing&quot;: &quot;easeOutQuad&quot; }">
  ${plans.map(plan => `
  <div class="col-lg-4 col-md-8 md-mb-30px" style="">
  <div class="bg-white box-shadow-quadruple-large border border-radius-6px p-15 ps-18 pe-18 xl-p-13 text-center">
  <span class="fs-26 lh-30 ls-minus-05px d-block text-dark-gray fw-600">${plan.name}</span>
  <span class="fs-18 mb-25px d-inline-block">Unlimited users</span>
  <div class="row align-items-center">
  <div class="col-sm-5 pe-sm-0">
  <h2 class="text-dark-gray mb-0 fw-700 ls-minus-2px text-center text-sm-end"><sup class="fs-30">$</sup>${plan.price}</h2>
  </div>
  <div class="col-lg-7 col-sm-5 text-center text-sm-start last-paragraph-no-margin fs-15 lh-24">
  <p>per user/month billed annually</p>
  </div>
  </div>
  <ul class="p-0 mt-20px mb-30px list-style-01 text-start lh-normal">
  ${plan.features.map(feature => `
  <li class="border-color-extra-medium-gray pt-20px pb-20px text-dark-gray fw-500 d-flex">
  <i class="feather icon-feather-${feature.included ? 'check' : 'x'} fs-20 text-${feature.included ? 'green' : 'red'} me-10px"></i>${feature.name}
  </li>`).join('')}
  </ul>
  <div class="pricing-footer w-100">
  <a href="${plan.link}" class="btn btn-small btn-dark-gray btn-box-shadow btn-round-edge border-1 w-100">Choose package</a>
  </div>
  </div>
  </div>
  `).join('')}
  </div>
  </section>
  `;
  });
  
  























  ////////////////////
// InstagramZeroMarginCenterSection
//////////////////

/*
   Usage Example:

   {% InstagramZeroMarginCenterSection {
    images: [
      "https://via.placeholder.com/300x300", 
      "https://via.placeholder.com/300x300",
      "https://via.placeholder.com/300x300",
      "https://via.placeholder.com/300x300",
      "https://via.placeholder.com/300x300",
      "https://via.placeholder.com/300x300"
    ],
    instagramLink: "https://www.instagram.com"
   } %}
*/

eleventyConfig.addShortcode("InstagramZeroMarginCenterSection", function(data) {
    const { images, instagramLink } = data;
    return `
  <div class="row align-items-center justify-content-center mb-40px g-0 row-cols-3 row-cols-md-6 row-cols-sm-3 instagram-follow-api position-relative">
  ${images.map(image => `
  <div class="col instafeed-grid">
  <figure class="border-radius-0px"><a href="${instagramLink}" target="_blank"><img src="${image}" class="insta-image" alt="" data-no-retina=""><span class="insta-icon"><i class="fa-brands fa-instagram"></i></span></a></figure>
  </div>
  `).join('')}
  <div class="absolute-middle-center z-index-1 w-auto">
  <a href="${instagramLink}" target="_blank" class="btn btn-medium btn-switch-text btn-white btn-round-edge fw-600 ls-0px left-icon btn-box-shadow instagram-button">
  <span>
  <span><i class="fa-brands fa-instagram text-base-color fs-20"></i></span>
  <span class="btn-double-text" data-text="crafto instagram">crafto instagram</span>
  </span>
  </a>
  </div>
  </div>
  `;
  });

  



////////////////////
// TickerWithBackgroundImageSection
//////////////////

/*
   Usage Example:

   {% TickerWithBackgroundImageSection {
    backgroundImage: "https://via.placeholder.com/1920x1080",
    messages: [
      "Transformation of body and mind",
      "Devotion and love to warm our hearts",
      "More than the 30000+ people trusting crafto yoga",
      "Choose the most comfortable way to train"
    ]
   } %}
*/

eleventyConfig.addShortcode("TickerWithBackgroundImageSection", function(data) {
    const { backgroundImage, messages } = data;
    return `
  <section class="pt-40px pb-40px cover-background position-relative" style="background-image: url('${backgroundImage}')">
  <div class="container-fluid">
  <div class="row position-relative">
  <div class="col swiper text-center swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options="{ &quot;slidesPerView&quot;: &quot;auto&quot;, &quot;spaceBetween&quot;:0, &quot;centeredSlides&quot;: true, &quot;speed&quot;: 15000, &quot;loop&quot;: true, &quot;autoplay&quot;: { &quot;delay&quot;:1, &quot;disableOnInteraction&quot;: false }, &quot;navigation&quot;: { &quot;nextEl&quot;: &quot;.slider-four-slide-next-2&quot;, &quot;prevEl&quot;: &quot;.slider-four-slide-prev-2&quot; }, &quot;keyboard&quot;: { &quot;enabled&quot;: true, &quot;onlyInViewport&quot;: true }, &quot;effect&quot;: &quot;slide&quot; }">
  <div class="swiper-wrapper swiper-width-auto marquee-slide" style="transition-duration: 15000ms; transform: translate3d(-4555.23px, 0px, 0px);" id="swiper-wrapper-1036930e90cf2ea83" aria-live="off">
  ${messages.map((message, index) => `
  <div class="swiper-slide" role="group" aria-label="${index + 1} / ${messages.length}" data-swiper-slide-index="${index}">
  <div class="fs-26 alt-font text-white"><span class="w-10px h-10px border border-2 border-radius-100 border-color-white d-inline-block align-middle ms-50px me-50px sm-ms-30px sm-me-30px"></span>${message}</div>
  </div>
  `).join('')}
  </div>
  <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
  </div>
  </div>
  </div>
  </section>
  `;
  });
  



////////////////////
// SubscribeNewsletterSection
//////////////////

/*
   Usage Example:

   {% SubscribeNewsletterSection {
    backgroundImageUrl: "https://via.placeholder.com/1920x1080",
    formActionUrl: "email-templates/subscribe-newsletter.php",
    redirectUrl: "thank-you.html"
   } %}
*/

eleventyConfig.addShortcode("SubscribeNewsletterSection", function(data) {
    const { backgroundImageUrl, formActionUrl, redirectUrl } = data;
    return `
    <section>
  <div class="container position-relative pt-3 pb-3 overlap-section md-mb-15px" style="margin-top: inherit;">
  <div class="position-absolute left-0px top-0px background-no-repeat background-size-100 h-100 w-100 animation-float" style="background-image: url('${backgroundImageUrl}')"></div>
  
  <div class="row row-cols-1 row-cols-lg-2 justify-content-center align-items-center bg-base-color pt-4 pb-4 ps-6 pe-6 lg-p-5 border-radius-6px g-0">
  <div class="col-xl-6 col-lg-7 md-mb-25px sm-mb-15px position-relative text-center text-lg-start">
  <h3 class="alt-font fw-500 text-white ls-minus-1px mb-10px shadow-none shadow-in" data-shadow-animation="true" data-animation-delay="700">Subscribe to <span class="fw-700 text-highlight d-inline-block">newsletter<span class="bg-white h-10px bottom-1px opacity-3 separator-animation"></span></span></h3>
  <span class="fs-20 text-white">Social media its ways of our excellence.</span>
  </div>
  <div class="col-lg-5 offset-xl-1 position-relative">
  <div class="d-inline-block w-100 newsletter-style-03 position-relative">
  <form action="${formActionUrl}" method="post" class="position-relative w-100">
  <input class="input-large bg-white border-color-white w-100 box-shadow-extra-large form-control required" type="email" name="email" placeholder="Enter your email...">
  <input type="hidden" name="redirect" value="${redirectUrl}">
  <button class="btn btn-large text-dark-gray ls-0px left-icon submit fw-700" aria-label="submit"><i class="icon feather icon-feather-mail icon-small text-base-color"></i><span>Subscribe</span></button>
  <div class="form-results border-radius-4px pt-10px pb-10px ps-15px pe-15px fs-16 lh-22 mt-10px w-100 text-center position-absolute d-none"></div>
  </form>
  </div>
  </div>
  </div>
  
  </div>
  </section>
  `;
  });

  




  ////////////////////
// AnimatedBoxVideoPlayerWithPlayButton
//////////////////

/*
   Usage Example:

   {% AnimatedBoxVideoPlayerWithPlayButton {
    videoUrl: "https://www.youtube.com/watch?v=cfXHhfNy7tU",
    backgroundImageUrl: "https://via.placeholder.com/1920x1080",
    altText: "Play Video"
   } %}
*/

eleventyConfig.addShortcode("AnimatedBoxVideoPlayerWithPlayButton", function(data) {
    const { videoUrl, backgroundImageUrl, altText } = data;
    return `
    <section class="bg-nero-grey background-position-center-top pb-0" style="background-image: url('images/demo-architecture-dotted-pattern.svg')">
    <div class="container">
  <div class="row overlap-section" style="margin-top: inherit;">
  <div class="col-12">
  <div class="position-absolute top-0px left-0px w-100 h-100" data-atropos-offset="5">
  <a href="${videoUrl}" class="absolute-middle-center text-center bg-base-color rounded-circle video-icon-box video-icon-extra-large popup-youtube">
  <span>
  <span class="video-icon text-dark-gray fw-800 text-uppercase ls-1px">${altText}</span>
  </span>
  </a>
  </div>
  <div data-atropos="" data-0-top="filter: grayscale(1);" data-15-bottom="filter: grayscale(0);" class="" style="">
  <div class="atropos-scale" style="transform: translate3d(0px, 0px, 0px); transition-duration: 300ms;">
  <div class="atropos-rotate" style="transition-duration: 300ms; transform: translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg);">
  <div class="atropos-inner overflow-visible">
  <div class="border-radius-6px h-650px md-h-450px sm-h-350px d-flex align-items-end justify-content-center overflow-hidden cover-background" style="background-image: url('${backgroundImageUrl}'); transition-duration: 300ms; transform: translate3d(0px, 0px, 0px);" data-atropos-offset="-5">
  <div class="opacity-very-light bg-dark-gray"></div>
  </div>
  <span class="atropos-highlight" style="transform: translate3d(0px, 0px, 0px); transition-duration: 300ms; opacity: 0;"></span></div>
  <span class="atropos-shadow" style="transform: translate3d(0px, 0px, -50px) scale(1); transition-duration: 300ms;"></span></div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </section>
  `;
  });
  
  



////////////////////
// BeautifulSliderSection
//////////////////

/*
   Usage Example:

   {% BeautifulSliderSection [
      {
        src: "https://via.placeholder.com/510x300",
        title: "Interior design",
        description: "Lorem ipsum consectetur elit do eiusmod tempor incididunt."
      },
      {
        src: "https://via.placeholder.com/510x300",
        title: "Modern Architecture",
        description: "Duis aute irure dolor in reprehenderit in voluptate velit esse."
      },
      {
        src: "https://via.placeholder.com/510x300",
        title: "Creative Spaces",
        description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco."
      }
    ] %}
*/

eleventyConfig.addShortcode("BeautifulSliderSection", function(images) {
    const sliderOptions = {
      slidesPerView: 1,
      spaceBetween: 35,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false
      },
      pagination: {
        el: ".slider-four-slide-pagination-1",
        clickable: true,
        dynamicBullets: false
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      breakpoints: {
        1200: { slidesPerView: 4 },
        992: { slidesPerView: 3 },
        768: { slidesPerView: 3 },
        320: { slidesPerView: 1 }
      },
      effect: "slide",
      slideChangeOnClick: "1", 
      thumbSliderMdDirection: "horizontal" 
    };
  
    return `
    <section>
  <div class="row align-items-center">
      <div class="col-md-12 position-relative">
      <div class="outside-box-right-30 sm-outside-box-right-0">
      <div class="swiper slider-three-slide magic-cursor base-color swiper-initialized swiper-horizontal swiper-backface-hidden" data-slider-options='${JSON.stringify(sliderOptions)}'>
      <div class="swiper-wrapper" id="swiper-wrapper-56d7867fbc42e8d8" aria-live="off" style="transition-duration: 0ms; transform: translate3d(-3815px, 0px, 0px);">
      ${images.map(image => `
      <div class="swiper-slide" style="width: 510px; margin-right: 35px;" role="group" data-swiper-slide-index="2">
      <div class="interactive-banner-style-06">
      <div class="interactive-banners-image">
      <img src="${image.src}" alt="" data-no-retina="">
      <div class="overlay-bg bg-gradient-dark-transparent opacity-light"></div>
      <a href="#" class="banners-icon icon-hover-base-color text-white position-absolute top-60px left-60px md-top-30px md-left-30px">
      <i class="line-icon-Full-View icon-large"></i>
      </a>
      </div>
      <div class="interactive-banners-content p-60px md-p-30px">
      <div class="h-100 w-100 last-paragraph-no-margin">
      <a href="#" class="fs-22 d-block text-white mb-10px fw-500">${image.title}</a>
      <p class="interactive-banners-content-text w-95 lg-w-100">${image.description}</p>
      </div>
      </div>
      <div class="box-overlay bg-gradient-dark-transparent"></div>
      </div>
      </div>
      `).join('')}
      </div>
      <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
      </div>
      </div>
      </div>
      </div>
      </section>
  `;
  });
  

  

////////////////////
// ProductDetailTopBarSection
//////////////////

/*
   Usage Example:

   {% ProductDetailTopBarSection {
     title: "Discover depth of beach",
     location: "Maldives, South Asia",
     price: "$1599",
     reviewCount: 16,
     starCount: 5
   } %}
*/

eleventyConfig.addShortcode("ProductDetailTopBarSection", function(data) {
    const { title, location, price, reviewCount, starCount } = data;
    return `
  <div class="row align-items-center mb-25px">
  <div class="col-sm-9">
  <h3 class="alt-font text-dark-gray fw-600 mb-10px ls-minus-1px">${title}</h3>
  <ul class="p-0 m-0 list-style-02 d-block d-sm-flex">
  <li class="text-dark-gray fw-500"><i class="bi bi-geo-alt icon-small me-5px"></i>${location}</li>
  <li class="ms-20px xs-ms-0">
  <div class="review-star-icon fs-18 me-5px">
  ${'&#9733;'.repeat(starCount)}${'&#9734;'.repeat(5 - starCount)}
  </div>
  <a href="#reviews" class="text-dark-gray text-dark-gray-hover fw-500 d-inline-block section-link">${reviewCount} Reviews</a>
  </li>
  </ul>
  </div>
  <div class="col-sm-3 text-sm-end xs-mt-10px">
  <h4 class="text-dark-gray fw-600 mb-0">${price}</h4>
  <span class="d-block lh-22">Per person</span>
  </div>
  </div>
  `;
  });
  

  








  ////////////////////
// AlternateProductUpDownSection
//////////////////

/*
   Usage Example:

   {% AlternateProductUpDownSection {
    products: [
      {
        link: "demo-web-agency-single-project-creative.html",
        image: "https://via.placeholder.com/600x400",
        title: "Tailoring inteo",
        category: "Branding",
        animationDirection: "up"
      },
      {
        link: "demo-web-agency-single-project-creative.html",
        image: "https://via.placeholder.com/600x400",
        title: "Design blast",
        category: "Photography",
        animationDirection: "down"
      },
      {
        link: "demo-web-agency-single-project-creative.html",
        image: "https://via.placeholder.com/600x400",
        title: "Herbal beauty",
        category: "Application",
        animationDirection: "up"
      }
    ]
   } %}
*/

eleventyConfig.addShortcode("AlternateProductUpDownSection", function(data) {
    const { products } = data;
    return `
    <section class="pb-0 pt-0 ps-2 pe-2 lg-pt-3 md-pt-7 sm-p-0">
    <div class="container">
  <div class="container-fluid">
  <div class="row justify-content-center m-md-0">
  <div class="col-12 filter-content">
  <ul class="portfolio-simple portfolio-wrapper grid grid-4col xxl-grid-4col xl-grid-4col lg-grid-3col md-grid-2col sm-grid-2col xs-grid-1col gutter-extra-large text-center" style="position: relative; height: 681.494px;">
  <li class="grid-sizer"></li>
  ${products.map((product, index) => `
  <li class="grid-item selected ${product.category.toLowerCase()} transition-inner-all" style="position: absolute; left: ${25 * index}%; top: 0px;">
  <div class="portfolio-box skrollable skrollable-between" data-bottom-top="transform: translateY(${product.animationDirection === 'up' ? '40px' : '-40px'})" data-top-bottom="transform: translateY(${product.animationDirection === 'up' ? '-40px' : '40px'})" style="transform: translateY(${product.animationDirection === 'up' ? '-14.8925px' : '16.7742px'});">
  <div class="portfolio-image bg-medium-gray border-radius-6px">
  <a href="${product.link}"><img src="${product.image}" alt="" data-no-retina=""></a>
  </div>
  <div class="portfolio-caption pt-35px pb-35px md-pt-25px md-pb-25px">
  <a href="${product.link}" class="text-dark-gray text-dark-gray-hover fw-600">${product.title}</a>
  <span class="d-inline-block align-middle w-10px separator-line-1px bg-light-gray ms-10px me-10px"></span>
  <div class="d-inline-block">${product.category}</div>
  </div>
  </div>
  </li>
  `).join('')}
  </ul>
  </div>
  </div>
  </div>
  </container>
  </seection>
  `;
  });
  




  ////////////////////
// ContactInfoAndFormSection
//////////////////

/*
   Usage Example:

   {% ContactInfoAndFormSection %}
*/

eleventyConfig.addShortcode("ContactInfoAndFormSection", function() {
    return `
  <section class="p-0 sm-pt-50px">
  <div class="container overlap-section" style="margin-top: -353.224px;">
  <div class="row justify-content-center box-shadow-quadruple-large border-radius-6px overflow-hidden g-0">
  <div class="col-lg-6">
  <div class="p-15 lg-p-13 md-p-10 bg-white h-100 background-position-right-bottom background-no-repeat xs-background-image-none" style="background-image: url('https://via.placeholder.com/600x400')">
  <span class="ps-25px pe-25px mb-25px text-uppercase text-dark-gray fs-13 lh-42 ls-1px alt-font fw-700 border-radius-4px bg-gradient-chablis-red-quartz-white d-inline-block">Keep in touch</span>
  <h3 class="alt-font text-dark-gray fw-600">Looking for help? Ready to help!</h3>
  <div class="mt-11">
  <div class="col icon-with-text-style-08 mb-25px">
  <div class="feature-box feature-box-left-icon-middle border-bottom pb-25px border-color-extra-medium-gray">
  <div class="feature-box-icon me-25px xs-me-15px lh-0px">
  <i class="bi bi-telephone-outbound icon-medium text-dark-gray"></i>
  </div>
  <div class="feature-box-content">
  <span class="alt-font fs-18 fw-500">Feel free to get in touch?</span>
  <span class="d-block fw-600 alt-font fs-20"><a href="tel:1234567890" class="text-dark-gray">123 456 7890</a></span>
  </div>
  </div>
  </div>
  <div class="col icon-with-text-style-08 mb-25px">
  <div class="feature-box feature-box-left-icon-middle border-bottom pb-25px border-color-extra-medium-gray">
  <div class="feature-box-icon me-25px xs-me-15px lh-0px">
  <i class="bi bi-envelope icon-medium text-dark-gray"></i>
  </div>
  <div class="feature-box-content">
  <span class="alt-font fs-18 fw-500">How can we help you?</span>
  <span class="d-block fw-600 alt-font fs-20"><a href="mailto:help@yourdomain.com" class="text-dark-gray">help@yourdomain.com</a></span>
  </div>
  </div>
  </div>
  <div class="col icon-with-text-style-08">
  <div class="feature-box feature-box-left-icon-middle">
  <div class="feature-box-icon me-25px xs-me-15px lh-0px">
  <i class="bi bi-chat-text icon-medium text-dark-gray"></i>
  </div>
  <div class="feature-box-content">
  <span class="alt-font fs-18 fw-500">Are you ready for coffee?</span>
  <span class="text-dark-gray d-block alt-font fw-600 fs-20">401 Broadway, London</span>
  </div>
  </div>
  </div>
  </div>
  </div>
  
  <div class="col-lg-6 contact-form-style-03">
  <div class="p-15 lg-p-13 md-p-10 bg-dark-gray h-100">
  <h1 class="fw-600 alt-font text-white fancy-text-style-4 ls-minus-1px">Say
  <span data-fancy-text="{ &quot;effect&quot;: &quot;rotate&quot;, &quot;string&quot;: [&quot;hello!&quot;, &quot;hallå!&quot;, &quot;salve!&quot;] }" class="appear"><span class="anime-text words chars splitting" data-splitting="true" style="--word-total: 1; --char-total: 6;"><span class="word" data-word="hello!" style="--word-index: 0;"><span class="char" data-char="h" style="--char-index: 0; opacity: 1; transform: rotateX(0deg);">h</span><span class="char" data-char="e" style="--char-index: 1; opacity: 1; transform: rotateX(0deg);">e</span><span class="char" data-char="l" style="--char-index: 2; opacity: 1; transform: rotateX(0deg);">l</span><span class="char" data-char="l" style="--char-index: 3; opacity: 1; transform: rotateX(0deg);">l</span><span class="char" data-char="o" style="--char-index: 4; opacity: 1; transform: rotateX(0deg);">o</span><span class="char" data-char="!" style="--char-index: 5; opacity: 1; transform: rotateX(0deg);">!</span></span></span></span>
  </h1>
  
  <form action="email-templates/contact-form.php" method="post">
  <div class="position-relative form-group mb-20px">
  <span class="form-icon"><i class="bi bi-person icon-extra-medium"></i></span>
  <input class="ps-0 border-radius-0px fs-17 bg-transparent border-color-transparent-white-light placeholder-medium-gray form-control required" type="text" name="name" placeholder="Enter your name*">
  </div>
  <div class="position-relative form-group mb-20px">
  <span class="form-icon"><i class="bi bi-envelope icon-extra-medium"></i></span>
  <input class="ps-0 border-radius-0px fs-17 bg-transparent border-color-transparent-white-light placeholder-medium-gray form-control required" type="email" name="email" placeholder="Enter your email address*">
  </div>
  <div class="position-relative form-group form-textarea mt-15px mb-25px">
  <textarea class="ps-0 border-radius-0px fs-17 bg-transparent border-color-transparent-white-light placeholder-medium-gray form-control" name="comment" placeholder="Enter your message" rows="4"></textarea>
  <span class="form-icon"><i class="bi bi-chat-square-dots icon-extra-medium"></i></span>
  <input type="hidden" name="redirect" value="">
  <button class="btn btn-small btn-gradient-orange-sky-blue ls-1px mt-30px submit w-100 btn-round-edge-small" type="submit">Send message</button>
  <div class="form-results mt-20px d-none"></div>
  </div>
  <span class="text-white opacity-3 fs-14 lh-22 d-block">I accept the terms & conditions and i understand that my data will be hold securely in accordance with the privacy policy.</span>
  </form>
  
  </div>
  </div>
  </div>
  </div>
  </section>
  `;
  });
  









	///////////////////

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: ["md", "njk", "html", "liquid"],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content", // default: "."
			includes: "../_includes", // default: "_includes"
			data: "../_data", // default: "_data"
			output: "_site",
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};





