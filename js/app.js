function setVisibilityOfMenu(){
    $('.masthead').visibility({
        once: false,
        onBottomPassed: function() {
            $('.fixed.menu').transition('fade in');
            $('.menu .item').removeClass('active');
        },
        onBottomPassedReverse: function() {
            $('.fixed.menu').transition('fade out');
            $('.menu_home').addClass('active');
        }
    });

    var segments = ['home', 'projects', 'skills', 'contact']

    for(let i=1; i<segments.length; i++){
        $('#seg_' + segments[i]).visibility({
            once: false,
            onTopPassed: function(){
                $('.menu .item').removeClass('active');
                $('.menu_' + segments[i]).addClass('active');
            },
            onTopPassedReverse: function(){
                $('.menu .item').removeClass('active');
                $('.menu_' + segments[i-1]).addClass('active');
            }
        });
    }
}

function setMenuScroll(){
    $('.menu .item').on('click', function(event){
        var id = $(this).attr('href').replace('#', '')
        var position = $('#' + id).offset().top + 5;
        $('html, body').animate({ scrollTop: position }, 500);
        var menuitem = '.menu_' + id.split("_")[1]
        $('.menu .item').removeClass('active');
        $(menuitem).addClass('active');
        event.preventDefault();
    });
}

function setDimmer(mode){
    if(mode){
        $('.fullpage').hide();
        $('.page.dimmer').dimmer('show');
    }
    else{
        $('.page.dimmer').dimmer('hide');
        $('.fullpage').show();
    }
}

function formatDate(isodate) {
    var date = new Date(isodate);
    var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function addProjectCards(projects){
    for(let p in projects){
        prepo = projects[p].repo;
        pname = ("name" in projects[p])?projects[p].name:prepo;
        plang = projects[p].language;
        pdesc = projects[p].description;
        ptool = ""

        for(let tool of projects[p].tools){
            ptool += "<li>" + tool + "</li>";
        }

        if(projects[p].type == "github"){
            $.get("https://api.github.com/repos/ccd97/"  + prepo, function(json){
                $('#udate-' + p).append("Updated on " + formatDate(json.pushed_at));
                if(json.stargazers_count > 0 || json.forks_count > 0){
                    star_count_html = `<span class="icount">` + json.stargazers_count + `</span>`
                    fork_count_html = `<span class="icount">` + json.forks_count + `</span>`
                    $('#stat-' + p).append(`<i class="fitted star outline icon"></i>` + star_count_html);
                    $('#stat-' + p).append(`<i class="fitted fork icon"></i>` + fork_count_html);
                }
                $('#stat-' + p).append(`<a class="right floated" href="`
                    + json.html_url +`" target="_blank">Visit <i class="github icon"></i></a>`);
            });
        }
        else{
            setTimeout(function(){
                if("updated_at" in projects[p])
                    $('#udate-' + p).append("Updated on " + projects[p].updated_at);
                if("type" in projects[p] && projects[p].type == "gitlab"){
                    repourl = "https://gitlab.com/madhu667/" + projects[p].repo;
                    $('#stat-' + p).append(`<a class="right floated" href="`
                    + repourl +`" target="_blank">Visit <i class="gitlab icon"></i></a>`);
                }
                else
                    $('#stat-' + p).append(`<a class="right floated" href="`
                            + projects[p].link +`" target="_blank">Visit Project</a>`);
            }, 300);
        }

        cardhtml = `
            <div class="ui fluid card">
                <div class="content hr12">
                    <div class="header">` + pname + `
                        <span class="right floated language-label ` + plang + `">
                            <span class="language-bullet">●</span>&nbsp; ` + plang +`
                        </span>
                    </div>
                    <div class="meta"><span class="date" id="udate-` + p +`"></span></div>
                    <div class="description">` + pdesc +`</div>
                </div>
                <div class="content hr9">
                    <div class="description">
                        Tools/Technologies used : <br>
                        <ul class="ui list">` + ptool +`</ul>
                    </div>
                </div>
                <div class="extra content" id="stat-` + p +`"></div>
            </div>`

            $('#project-cards').append(cardhtml);
    }
}

function addSkillCards(skills){

    first_card = true;

    for(let skillset of skills){
        sstitle = skillset.title;
        sscontent = ""

        for(let scont of skillset.content){
            sscontent += `<div class="description">` + scont.description;
            sscontent += `<br><ul class="ui list">`;
            for(let skill of scont.skill_list){
                if(first_card) p_pos = "right center";
                else p_pos = "left center"
                sweak = skill.weak?` class="weak-skill" `:"";
                spop = ("popup" in skill)?` data-tooltip="`+ skill.popup +`" data-position="` + p_pos +`" `:"";
                sscontent += `<li><div ` + sweak + spop + `> ` + skill.name + "</div></li>";
            }
            sscontent += "</ul></div><br>"
        }
        cardhtml = `
            <div class="ui fluid card">
                <div class="content">
                    <div class="header">` + sstitle + `</div> ` + sscontent +`
                </div>
            </div>`

        $('#skill-cards').append(cardhtml);

        if(first_card) first_card = false;
    }
}

function prepareData() {
    $.getJSON("https://ccd97.pythonanywhere.com/protfolio_data/")
        .done(function(json) {
            preparePage(json);
        })
        .fail(function() {
            $.getJSON('data/fallback_protfolio_data.json', function(json) {
                preparePage(json);
            });
        });
}

function preparePage(data) {
    setVisibilityOfMenu();
    setMenuScroll();
    addProjectCards(data.projects);
    addSkillCards(data.skills);
    setDimmer(false);
}

$(document).ready(function() {
    setDimmer(true);
    prepareData();
});
