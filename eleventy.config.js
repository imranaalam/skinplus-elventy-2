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
                    <div class="col-xl-6 col-lg-6 position-relative top-minus-2px md-mb-30px" data-anime='{ "effect": "slide", "color": "#f2e0dc", "direction":"lr", "easing": "easeOutQuad", "duration": 600, "delay":500}'> 
                        <img src="${mainImageUrl}" class="border-radius-rb-50px" alt="">
                    </div>
                    <div class="col-xl-4 col-lg-6 offset-xl-1 lg-ps-15px lg-pe-15px text-center text-lg-start" data-anime='{ "el": "childs", "translateY": [30, 0], "opacity": [0,1], "duration": 600, "delay": 300, "staggervalue": 300, "easing": "easeOutQuad" }'> 
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
                            <div class="outside-box-right-25 sm-outside-box-right-0 appear anime-complete" data-anime="{ &quot;translateY&quot;: [0, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 1200, &quot;delay&quot;: 100, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot;}">
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
	// DynamicCreativeSolutionsSection
	//////////////////

	/*
   Usage
   /*
   {% DynamicCreativeSolutionsSection {
    backgroundImageUrl: "url('https://via.placeholder.com/1920x1080')",
    videoUrl: "https://www.youtube.com/watch?v=cfXHhfNy7tU",
    rotationWords: ["business!", "problems!", "brands!"],
    contactUrl: "demo-corporate-contact.html"
   } %}
*/

	eleventyConfig.addShortcode(
		"DynamicCreativeSolutionsSection",
		function ({ backgroundImageUrl, videoUrl, rotationWords, contactUrl }) {
			const rotationWordsMarkup = rotationWords
				.map(
					(word) =>
						`<span class="char">${word
							.split("")
							.join('</span><span class="char">')}</span>`
				)
				.join("");

			return `
        <section class="p-0">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12">
                        <div class="border-radius-6px h-450px md-h-350px sm-h-400px d-flex flex-wrap align-items-center justify-content-center overflow-hidden cover-background box-shadow-quadruple-large pt-15" style="background-image: ${backgroundImageUrl}">
                            <div class="opacity-full-dark bg-gradient-regal-blue-transparent"></div>
                            <div class="row justify-content-center m-0">
                                <div class="col-lg-7 col-md-8 z-index-1 text-center text-md-start sm-mb-20px">
                                    <h3 class="text-white mb-0 fw-400 fancy-text-style-4">We make the creative solutions for <span class="fw-600 appear" data-fancy-text='{ "effect": "rotate", "strings": ${JSON.stringify(
																			rotationWords
																		)} }'>
                                        <span class="anime-text words chars splitting" data-splitting="true">${rotationWordsMarkup}</span>
                                    </span></h3>
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
                    <div class="col-lg-6 md-mb-50px appear" data-anime="{ "effect": "slide", "color": "#005153", "direction":"rl", "easing": "easeOutQuad", "delay":50}" style="position: relative;">
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

eleventyConfig.addShortcode("DynamicProjectShowcase", function({ projects }) {
    return `
        <section class="stack-box py-0 z-index-99 forward">
            <div class="stack-box-contain">
                ${projects.map((project, index) => {
                    const projectNumber = (index + 1 < 10) ? '0' + (index + 1) : (index + 1).toString();
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
                }).join('')}
            </div>
        </section>
    `;
});







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

eleventyConfig.addShortcode("PopularProductsSliderSection", function({ products }) {
    return `
        <section class="overflow-hidden overlap-height position-relative">
            <div class="container-fluid overlap-gap-section">
                <div class="row justify-content-center mb-2">
                    ${products.map(product => `
                    <div class="col-lg-7 text-center">
                        <span class="fs-15 fw-600 text-red text-uppercase mb-10px d-block">
                            <span class="w-5px h-2px bg-red d-inline-block align-middle me-5px"></span>
                            ${product.title}
                            <span class="w-5px h-2px bg-red d-inline-block align-middle ms-5px"></span>
                        </span>
                        <h2 class="alt-font text-dark-gray">${product.title}</h2>
                    </div>
                    `).slice(0, 1).join('')}
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
                                ${products.map(product => `
                                <div class="swiper-slide">
                                    <div class="services-box-style-01 hover-box last-paragraph-no-margin">
                                        <div class="position-relative box-image border-radius-6px">
                                            <img class="w-100" src="${product.imageUrl}" alt="${product.name}" data-no-retina="">
                                            <div class="box-overlay bg-dark-gray"></div>
                                            <span class="d-flex justify-content-center align-items-center mx-auto icon-box absolute-middle-center z-index-1 w-130px h-130px rounded-circle bg-white box-shadow-extra-large text-uppercase alt-font fs-30 lh-28 text-red ps-15px pe-15px text-center">
                                                Just $${product.price}
                                            </span>
                                        </div>
                                        <div class="pt-30px bg-white text-center">
                                            <span class="d-inline-block text-dark-gray fs-19 fw-600">${product.name}</span>
                                            <div class="w-100">
                                                ${product.ingredients.map(ingredient => `
                                                    <span class="d-inline-block align-middle">${ingredient}</span>
                                                    <span class="d-inline-block align-middle ms-10px me-10px fs-12 opacity-5">◍</span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                `).join('')}
                            </div>
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
