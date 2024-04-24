const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");

module.exports = function(eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
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
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for(let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
	});

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "#",
				ariaHidden: false,
			}),
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		});
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	})

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


	
		eleventyConfig.addShortcode("bannerSlider", function({
			backgroundImage = 'https://via.placeholder.com/1920x1100', // Default background image
			leftImage = 'https://via.placeholder.com/600x400',         // Default left image
			rightImage = 'https://via.placeholder.com/600x400',        // Default right image
			mainTitle = 'Beauty Studio',
			subTitle = 'A salon is an establishment dealing with natural cosmetic treatments.',
			buttonLink = '#',
			buttonText = 'Book Appointment'
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
		});
	
	

	

	

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
	


		eleventyConfig.addShortcode("featureSection", function({
			leftImageUrl = 'https://via.placeholder.com/95x125', // Default left image
			awardTitle = 'Best beauty salon', // Default title
			awardYear = '2023', // Default award year
			description = 'Multi award winning beauty salon services.', // Default description
			discountText = 'Get 20% off on bridal makeup', // Default discount text
			discountLink = '/current-page' // Default to the current page
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
		});
	
	


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

eleventyConfig.addShortcode("featuredSection", function({
    mainImageUrl = 'https://via.placeholder.com/960x630', // Default image if none provided
    title = 'Explore Our Services', // Default title
    description = 'Detailed overview of our services and commitments.', // Default description
    primaryLink = '#', // Default primary link
    primaryButtonText = 'Learn More', // Default text for primary button
    secondaryUrl = 'https://www.youtube.com/watch?v=XYZ', // Default video URL
    secondaryButtonText = 'Watch Video' // Default text for video button
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
});



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

eleventyConfig.addShortcode("processStepsSection", function({ steps = [] }) {
    if (!Array.isArray(steps)) {
        console.error("Invalid 'steps' provided to 'processStepsSection'. Expected an array.");
        return ""; // Return an empty string or some error message in the output if desired
    }

    let stepItems = steps.map(step => `
        <div class="col process-step-style-08 ${step.isEnd ? '' : 'border-end border-color-extra-medium-gray'} d-flex justify-content-center ${step.isEnd ? '' : 'md-border-end-0 md-mb-40px'}">
            <div class="process-step-item d-flex align-items-start">
                <div class="process-step-icon-wrap d-flex align-items-center col-auto">
                    <span class="number text-dark-gray fs-26 alt-font">${step.number}</span>
                    <span class="progress-step-separator bg-base-color w-20px separator-line-2px d-block ms-15px"></span>
                </div>
                <div class="col process-content last-paragraph-no-margin ms-15px">
                    <span class="d-block text-dark-gray fs-24 alt-font">${step.title}</span>
                    <p>${step.description}</p>
                </div>
            </div>
        </div>
    `).join('');

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

eleventyConfig.addShortcode("ServicesSection", function({ headerText, headerSubText, services, exploreLink, exploreText, learnMoreLink, learnMoreText }) {
    const serviceItems = services.map(service => `
        <div class="col mb-20px">
            <div class="services-box-style-01 hover-box">
                <div class="position-relative box-image border-radius-6px overflow-hidden">
                    <a href="${service.link || '#'}">
                        <img src="${service.imageUrl || 'https://via.placeholder.com/755x510'}" alt="">
                        <div class="box-overlay bg-gradient-blue-ironstone-brown"></div>
                        <span class="d-flex justify-content-center align-items-center mx-auto icon-box absolute-middle-center z-index-1 w-65px h-65px rounded-circle border border-color-transparent-white border-1"><i class="bi bi-arrow-right-short text-white icon-very-medium d-flex"></i></span>
                    </a>
                </div>
                <div class="p-25px last-paragraph-no-margin text-center">
                    <span class="fs-22 text-dark-gray alt-font">${service.title}</span>
                    <p class="lh-26">${service.description}</p>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <section class="overlap-height">
            <div class="container overlap-gap-section">
                <div class="row justify-content-center align-items-center mb-6">
                    <div class="col-auto pe-25px border-2 border-end border-color-dark-gray sm-border-end-0 sm-pe-15px">
                        <span class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px">${headerText}</span>
                    </div>
                    <div class="col-12 col-md-auto ps-25px sm-ps-15px text-center">
                        <h3 class="alt-font fw-400 text-dark-gray ls-minus-1px mb-0">${headerSubText}</h3>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-lg-3 row-cols-md-2 transition-inner-all justify-content-center mb-4">
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
});









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

eleventyConfig.addShortcode("PricingSection", function({ headerText, headerSubText, pricing, exploreLink = "#", exploreText = "Explore package", learnMoreLink = "#", learnMoreText = "Learn More" }) {
    const pricingItems = pricing.map(item => `
        <div class="col-lg-6 pe-50px lg-pe-30px md-pe-15px pricing-table-style-09">
            <div class="row border-top border-color-extra-medium-gray g-0 xs-pt-20px xs-pb-20px">
                <div class="col-sm-3 text-center align-self-center">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/100x105'}" class="w-55px" alt="">
                </div>
                <div class="col-sm-7 text-center text-sm-start last-paragraph-no-margin ps-40px pe-40px pt-30px pb-30px border-start border-color-extra-medium-gray">
                    <span class="alt-font text-dark-gray fs-20">${item.title}</span>
                    <p class="lh-26">${item.description}</p>
                </div>
                <div class="col-sm-2 text-center text-sm-start align-self-center">
                    <h4 class="alt-font text-dark-gray mb-0 fw-400">${item.price}</h4>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <section class="overlap-height">
            <div class="container overlap-gap-section">
                <div class="row">
                    <div class="col-12 text-center">
                        <h6 class="fs-16 text-uppercase text-gradient-san-blue-new-york-red fw-700 ls-1px">${headerText}</h6>
                        <h3 class="alt-font fw-400 text-dark-gray ls-minus-1px mb-6">${headerSubText}</h3>
                    </div>
                </div>
                <div class="row justify-content-between align-items-center mb-5 xs-mb-6">
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
});


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

eleventyConfig.addShortcode("BenefitsSection", function({ headerText, headerSubText, benefits, primaryLink = "#", primaryButtonText = "Learn More" }) {
    const benefitItems = benefits.map(benefit => `
        <div class="col icon-with-text-style-04 transition-inner-all">
            <div class="feature-box box-shadow-triple-large-hover h-100 border-bottom border-end border-color-extra-medium-gray md-border-bottom p-18 lg-p-11">
                <div class="feature-box-icon mb-20px">
                    <img src="${benefit.imageUrl || 'https://via.placeholder.com/100x100'}" alt="" data-no-retina="">
                </div>
                <div class="feature-box-content">
                    <span class="d-block text-dark-gray fs-19 lh-28">${benefit.title}</span>
                    <p>${benefit.description}</p>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <div class="container">
            <div class="row justify-content-center mb-3">
                <div class="col-xl-6 col-lg-8 text-center">
                    <span class="fs-15 fw-600 text-base-color text-uppercase ls-3px">${headerText}</span>
                    <h3 class="alt-font text-dark-gray ls-minus-1px">${headerSubText}</h3>
                </div>
            </div>
            <div class="row row-cols-1 row-cols-lg-4 row-cols-md-3 row-cols-sm-2 text-center icon-with-style-2 g-0 border-top border-start border-color-extra-medium-gray">
                ${benefitItems}
            </div>
      
        </div>
    `;
});





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

eleventyConfig.addShortcode("ImageAndTextSection", function({ mainImage, featureIcon, featureText, headerIcon, headerText, slides }) {
    const slideItems = slides.map(slide => `
        <div class="swiper-slide">
            <h2 class="alt-font text-dark-gray ls-minus-1px">${slide.title}</h2>
            <p class="w-80">${slide.text}</p>
        </div>
    `).join('');

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
});





































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


eleventyConfig.addShortcode("statsBox", function(rating, feedback, patients, ratingText, feedbackText, patientsText, stars) {
	let starIcons = '';
	for(let i = 0; i < stars; i++) {
	  starIcons += '<i class="bi bi-star-fill text-dark-gray"></i>';
	}
	
	return `
	<section class="pt-0 position-relative">
	<div class="container">
	<div class="row align-items-center">
	  <div class="row row-cols-1 row-cols-lg-3 row-cols-sm-2 mt-5 align-items-center justify-content-center appear anime-child anime-complete" data-anime="{ "el": "childs", "translateY": [30, 0], "opacity": [0,1], "duration": 800, "delay": 0, "staggervalue": 200, "easing": "easeOutQuad" }">
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
					  <span class="fs-18 text-dark-gray lh-26 d-block fw-600">${feedbackText.replace(' ', '<br>')}</span>
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
					  <span class="fs-18 lh-26 d-block fw-600">${patientsText.replace(' ', '<br>')}</span>
				  </div>
			  </div>
		  </div>
		  <!-- end content box item -->
	  </div>
	  </div>
	  </div>
	  </section>
	`;
  });

  





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

eleventyConfig.addShortcode("ServiceSliderSection", function({ backgroundPatternImage, mainTitle, subTitle, description, linkUrl, linkText, slides }) {
    const slideItems = slides.map(slide => `
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
    `).join('');

    return `
        <section class="pt-0 position-relative">
            <div class="position-absolute top-minus-70px lg-top-minus-50px left-minus-80px lg-left-minus-60px lg-w-300px opacity-1 w-350px z-index-1 d-none d-lg-inline-block"><img src="${backgroundPatternImage}" alt="" data-bottom-top="transform: translateY(-50px)" data-top-bottom="transform: translateY(50px)" class="" data-no-retina=""></div>
            <div class="bg-light-red border-radius-8px lg-no-border-radius pt-6 pb-6 md-pt-50px md-pb-50px overflow-hidden position-relative">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-xl-4 col-lg-5 md-mb-30px appear anime-child anime-complete" data-anime="{&quot;el&quot;: &quot;childs&quot;, &quot;translateY&quot;: [30, 0], &quot;opacity&quot;: [0,1], &quot;duration&quot;: 800, &quot;delay&quot;: 0, &quot;staggervalue&quot;: 150, &quot;easing&quot;: &quot;easeOutQuad&quot;}"> 
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
});





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

eleventyConfig.addShortcode("AppointmentRequestSection", function({ urgentContactImage = "https://via.placeholder.com/112x68", backgroundImage = "https://via.placeholder.com/448x434", contactNumber = "+1 234 567 8910", formActionURL = "/submit/appointment", doctorOptions = [] }) {
    let optionsHTML = doctorOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('');

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
                                <span class="fw-600 text-dark-gray">For urgent matters<br><a href="tel:${contactNumber.replace(/\s+/g, '')}" class="fs-22 ls-minus-05px fw-600 alt-font ">${contactNumber}</a></span>
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
});




















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

eleventyConfig.addShortcode("DynamicMediaSection", function({ mainImage = "https://via.placeholder.com/435x559", iconImage = "https://via.placeholder.com/58x51", secondaryImage = "https://via.placeholder.com/336x430", sectionTitle = "About medcare hospital", header = "Welcome to our medcare hospital.", description = "We value each and every human life placed in our hands and constantly work towards meeting the expectations of our customers and stake holders.", primaryLink = "demo-medical-about.html", primaryButtonText = "About hospital", secondaryLink = "demo-medical-timetable.html", secondaryButtonText = "Check timetable" }) {
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
});























///////////////////
// DynamicShowcaseSection
//////////////////

/*
   Usage
   /*

   {% DynamicShowcaseSection{
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

eleventyConfig.addShortcode("DynamicShowcaseSection", function({ banners, headerText, headerSubText, clients }) {
    const bannerItems = banners.map(banner => `
        <div class="col interactive-banner-style-08 md-mb-30px">
            <figure class="m-0 hover-box overflow-hidden position-relative border-radius-6px">
                <img src="${banner.imageUrl || 'https://via.placeholder.com/1160x640'}" alt="" data-no-retina="">
                <figcaption class="d-flex flex-column align-items-start justify-content-center position-absolute left-0px top-0px w-100 h-100 z-index-1 p-50px sm-p-6">
                    <span class="ps-15px pe-15px pt-5px pb-5px text-uppercase text-dark-gray fs-13 lh-24 fw-700 border-radius-4px bg-white d-inline-block">${banner.tag}</span>
                    <div class="d-flex w-100 align-items-center mt-auto">
                        <div class="col last-paragraph-no-margin pe-15px">
                            <h5 class="alt-font text-white mb-0">${banner.title}</h5>
                            <p class="lh-38 text-white fw-300 ls-05px opacity-6 mb-0">${banner.description}</p>
                        </div>
                        <span class="border border-2 border-color-transparent-white-very-light bg-transparent w-60px h-60px sm-w-50px sm-h-50px rounded-circle ms-auto position-relative">
                            <i class="bi bi-arrow-right-short absolute-middle-center icon-very-medium lh-0px text-white"></i>
                        </span>
                    </div>
                    <div class="position-absolute left-0px top-0px w-100 h-100 bg-gradient-gray-light-dark-transparent z-index-minus-1 opacity-9"></div>
                    <a href="${banner.link}" class="position-absolute z-index-1 top-0px left-0px h-100 w-100"></a>
                </figcaption>
            </figure>
        </div>
    `).join('');

    const clientItems = clients.map(client => `
        <div class="col text-center border-end border-bottom border-color-transparent-dark-very-light sm-border-end-0 transition-inner-all pt-40px pb-40px sm-pt-30px sm-pb-30px">
            <div class="client-box">
                <a href="${client.link}"><img src="${client.imageUrl || 'https://via.placeholder.com/225x110'}" alt="" data-no-retina=""></a>
            </div>
        </div>
    `).join('');

    return `
        <section class="bg-gradient-solitude-blue-fair-pink">
            <div class="container">
                <div class="row row-cols-1 row-cols-lg-2 mb-8 overlap-section">
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
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid",
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content",          // default: "."
			includes: "../_includes",  // default: "_includes"
			data: "../_data",          // default: "_data"
			output: "_site"
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
