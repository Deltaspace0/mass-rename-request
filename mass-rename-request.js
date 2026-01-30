//<nowiki>
mw.loader.using(['mediawiki.api'], function () {
    if (mw.config.get('wgCanonicalNamespace') !== 'Category') {
        return;
    }
    const scriptAdvertisement = '([[User:Deltaspace42/mass-rename-request|assisted]])';
    const username = mw.config.get('wgUserName');
    let isActive = false;
    $(function () {
        const actionLink = mw.util.addPortletLink(
            'p-cactions',
            '#mass-rename-controls',
            'Request renaming files',
            'ca-mass-rename-request',
            'Request renaming files in the current category.'
        );
        $(actionLink).on('click', toggleScript);
    });
    
    function toggleScript() {
        if (isActive) {
            deactivateScript();
        } else {
            activateScript();
        }
    }
    
    function activateScript() {
        isActive = true;
        $('#ca-mass-rename-request a').text('Cancel rename requests');
        $('.galleryfilename a, .gallerytext a').each(function() {
            const $link = $(this);
            const href = $link.attr('href');
            if (!href || !href.includes('/wiki/File:')) return;
            const fileName = $link.text();
            const $container = $link.closest('li, div').first();
            const originalBackground = $container.css('background');
            $container.data('original-background', originalBackground);
            const $input = $('<textarea>')
                .val(fileName)
                .attr('rows', 1)
                .attr('class', 'mass-rename-input')
                .css({
                    'width': '100%',
                    'padding': '2px',
                    'font-family': 'monospace',
                    'font-size': '12px',
                    'border': '1px solid #36c',
                    'resize': 'none',
                    'overflow': 'hidden',
                    'min-height': '1.2em',
                    'box-sizing': 'border-box',
                    'display': 'block',
                    'white-space': 'pre-wrap',
                    'word-wrap': 'break-word',
                    'overflow-wrap': 'break-word'
                })
                .on('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        $(this).blur();
                    }
                })
                .data('original', fileName);
            setTimeout(() => $input.trigger('input'), 0);
            $link.replaceWith($input);
            const $resetBtn = $('<button>')
                .text('X')
                .prop('disabled', true)
                .attr('title', 'Reset to original name')
                .attr('class', 'mass-rename-reset-btn')
                .css({
                    'margin-left': '5px',
                    'padding': '2px 6px',
                    'border': '1px solid #ccc',
                    'background': '#f8f9fa',
                    'cursor': 'pointer'
                })
            $container.append($resetBtn);
            
            function onOriginalName() {
                $resetBtn.prop('disabled', true);
                $container.css({
                    'background': originalBackground
                });
            }

            function onNewName() {
                $resetBtn.prop('disabled', false);
                $container.css({
                    'background': 'rgb(255,165,0)'
                });
            }

            function setName(name) {
                const cleanValue = name.replace(/[\r\n]+/g, ' ');
                if ($input.val() !== cleanValue) {
                    $input.val(cleanValue);
                }
                $input.css('height', 'auto');
                $input.css('height', $input.prop('scrollHeight') + 'px');
                if (cleanValue === fileName) {
                    onOriginalName();
                } else {
                    onNewName();
                }
            }

            $input.on('input', function() {
                setName($(this).val())
            })
            $input.data('setName', setName);
            $resetBtn.on('click', function() {
                $input.val(fileName);
                $input.trigger('input');
                onOriginalName();
            });
        });
        addControls();
    }
    
    function deactivateScript() {
        isActive = false;
        $('#ca-mass-rename-request a').text('Request renaming files');
        $('textarea.mass-rename-input').each(function() {
            const $input = $(this);
            const original = $input.data('original');
            const $container = $input.closest('li, div').first();
            $container.css('background', $container.data('original-background'));
            const $link = $('<a>')
                .attr('href', '/wiki/File:' + encodeURIComponent(original))
                .text(original);
            $input.replaceWith($link);
        });
        $('button.mass-rename-reset-btn').remove();
        $('#mass-rename-controls').remove();
    }
    
    function addControls() {
        const $controls = $('<div>')
            .attr('id', 'mass-rename-controls')
            .css({
                'background': '#f8f9fa',
                'border': '1px solid #a2a9b1',
                'padding': '10px',
                'margin': '10px 0',
                'border-radius': '3px'
            });
        const $rationaleRow = $('<div>')
            .css({'margin-bottom': '10px'})
            .appendTo($controls);
        $('<span>')
            .text('Rationale (number between 1 and 6, see ')
            .append($('<a>')
                .attr('href', mw.util.getUrl('Template:File renaming reasons/i18n'))
                .text('Template:File renaming reasons/i18n'))
            .append('): ')
            .appendTo($rationaleRow);
        const $rationaleInput = $('<input>')
            .attr('type', 'text')
            .attr('id', 'mass-rename-rationale')
            .css({'margin-left': '5px', 'padding': '3px', 'width': '50px'})
            .appendTo($rationaleRow);
        const savedRationale = localStorage.getItem('mass-rename-saved-rationale');
        if (savedRationale) {
            $rationaleInput.val(savedRationale);
        }
        const $reasonRow = $('<div>')
            .css({'margin-bottom': '10px'})
            .appendTo($controls);
        $('<span>')
            .text('Additional explanation / reason / justification:')
            .appendTo($reasonRow);
        const $reasonInput = $('<input>')
            .attr('type', 'text')
            .attr('id', 'mass-rename-reason')
            .css({'margin-left': '5px', 'padding': '3px', 'width': '250px'})
            .appendTo($reasonRow);
        const savedReason = localStorage.getItem('mass-rename-saved-reason');
        if (savedReason) {
            $reasonInput.val(savedReason);
        }
        const $replaceRow = $('<div>')
            .css({'margin-bottom': '10px'})
            .appendTo($controls);
        $('<span>')
            .text('Find:')
            .appendTo($replaceRow);
        const $findInput = $('<input>')
            .attr('type', 'text')
            .attr('id', 'mass-rename-find')
            .css({'margin': '0 5px', 'padding': '3px', 'width': '100px'})
            .on('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    findAndReplace();
                }
            })
            .appendTo($replaceRow);
        const savedFind = localStorage.getItem('mass-rename-saved-find');
        if (savedFind) {
            $findInput.val(savedFind);
        }
        $('<span>')
            .text('Replace:')
            .appendTo($replaceRow);
        const $replaceInput = $('<input>')
            .attr('type', 'text')
            .attr('id', 'mass-rename-replace')
            .css({'margin': '0 5px', 'padding': '3px', 'width': '100px'})
            .on('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    findAndReplace();
                }
            })
            .appendTo($replaceRow);
        const savedReplace = localStorage.getItem('mass-rename-saved-replace');
        if (savedReplace) {
            $replaceInput.val(savedReplace);
        }
        $('<button>')
            .text('Replace')
            .css({
                'padding': '8px 16px',
                'background': '#36c',
                'color': 'white',
                'border': 'none',
                'border-radius': '3px',
                'cursor': 'pointer',
                'font-weight': 'bold'
            })
            .on('click', findAndReplace)
            .appendTo($replaceRow);
        const $buttonRow = $('<div>')
            .css({'margin-bottom': '10px'})
            .appendTo($controls);
        $('<button>')
            .attr('id', 'mass-rename-submit-btn')
            .text('Submit rename requests')
            .css({
                'padding': '8px 16px',
                'background': '#36c',
                'color': 'white',
                'border': 'none',
                'border-radius': '3px',
                'cursor': 'pointer',
                'font-weight': 'bold'
            })
            .on('click', submitRequests)
            .appendTo($buttonRow);
        $('<button>')
            .text('Cancel')
            .css({
                'padding': '8px 16px',
                'margin': '0 16px',
                'background': 'rgb(25, 46, 88)',
                'color': 'white',
                'border': 'none',
                'border-radius': '3px',
                'cursor': 'pointer',
                'font-weight': 'bold'
            })
            .on('click', deactivateScript)
            .appendTo($buttonRow);
        $('#mw-category-media').prepend($controls);
    }

    function findAndReplace() {
        const originalPattern = $('#mass-rename-find').val();
        const targetPattern = $('#mass-rename-replace').val();
        localStorage.setItem('mass-rename-saved-find', originalPattern);
        localStorage.setItem('mass-rename-saved-replace', targetPattern);
        let replacedCount = 0;
        $('textarea.mass-rename-input').each(function() {
            const $input = $(this);
            const name = $input.val().replace(originalPattern, targetPattern);
            if (name !== $input.val()) {
                replacedCount++;
            }
            $input.data('setName')(name);
        });
        mw.notify(`Replaced ${replacedCount} names`);
    }
    
    function submitRequests() {
        const rationale = $('#mass-rename-rationale').val().trim();
        if (!rationale || !/^[1-6]$/.test(rationale)) {
            mw.notify('Please enter a valid rationale (1-6)', {type: 'error'});
            return;
        }
        const reason = $('#mass-rename-reason').val().trim();
        localStorage.setItem('mass-rename-saved-rationale', rationale);
        localStorage.setItem('mass-rename-saved-reason', reason);
        const changes = [];
        $('textarea.mass-rename-input').each(function() {
            const $input = $(this);
            const original = $input.data('original');
            const newName = $input.val().trim();
            if (newName && newName !== original) {
                changes.push({
                    original: original,
                    new: newName,
                    rationale: rationale,
                    reason: reason
                });
            }
        });
        if (changes.length === 0) {
            mw.notify('No changes to submit', {type: 'warn'});
            return;
        }
        if (!confirm(`Submit ${changes.length} rename request(s)?`)) {
            return;
        }
        const submitButton = $('#mass-rename-submit-btn');
        submitButton.prop('disabled', true);
        submitButton.text('Submitted 0 request(s)...');
        mw.notify(`Submitting ${changes.length} request(s)...`);
        let completed = 0;
        changes.forEach((change, i) => {
            setTimeout(() => {
                addRenameTemplate(change.original, change.new, change.rationale, change.reason)
                    .catch((err) => {
                        mw.notify(`Failed: ${change.original} - ${err}`, {type: 'error'});
                    })
                    .finally(() => {
                        completed++;
                        submitButton.text(`Submitted ${completed} request(s)...`);
                        if (completed === changes.length) {
                            mw.notify(`All ${changes.length} requests submitted`);
                            deactivateScript();
                        }
                    });
            }, i*200);
        });
    }
    
    function addRenameTemplate(fileName, newName, rationale, reason) {
        return new Promise((resolve, reject) => {
            const api = new mw.Api();
            api.get({
                action: 'query',
                titles: `File:${fileName}`,
                prop: 'revisions',
                rvprop: 'content'
            }).then((data) => {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId === '-1' || !pages[pageId].revisions) {
                    reject('File not found');
                    return;
                }
                const content = pages[pageId].revisions[0]['*'];
                if (content.includes('{{rename') || content.includes('{{Rename')) {
                    reject('Already has rename template');
                    return;
                }
                const newContent = `{{rename|1=${newName}|2=${rationale}|3=${reason}|user=${username}}}\n${content}`;
                return api.postWithToken('csrf', {
                    action: 'edit',
                    title: `File:${fileName}`,
                    text: newContent,
                    summary: `Requesting renaming this file to [[File:${newName}]]; Criterion ${rationale} `+scriptAdvertisement,
                    minor: true,
                    bot: true
                });
            }).then(resolve).catch(reject);
        });
    }
});
//</nowiki>
